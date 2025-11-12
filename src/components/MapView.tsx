import { useEffect, useRef, useState } from 'react';
import { Card, Empty, Spin } from 'antd';
import { TravelPlan } from '@/types';

declare global {
  interface Window {
    AMap: any;
  }
}

interface MapViewProps {
  plan: TravelPlan;
}

export default function MapView({ plan }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = () => {
      try {
        // 检查高德地图 API 是否加载
        if (!window.AMap) {
          setError('高德地图 API 未加载，请检查配置');
          setLoading(false);
          return;
        }

        // 创建地图实例
        const mapInstance = new window.AMap.Map(mapContainer.current, {
          zoom: 12,
          center: [116.397428, 39.90923], // 默认北京
          viewMode: '3D',
        });

        setMap(mapInstance);
        setLoading(false);

        // 添加标记点
        if (plan.itinerary) {
          const markers: any[] = [];

          // 添加景点标记
          plan.itinerary.days.forEach((day) => {
            day.activities.forEach((activity) => {
              if (activity.location.latitude && activity.location.longitude) {
                const marker = new window.AMap.Marker({
                  position: [activity.location.longitude, activity.location.latitude],
                  title: activity.name,
                });

                // 添加信息窗口
                const infoWindow = new window.AMap.InfoWindow({
                  content: `
                    <div style="padding: 10px;">
                      <h4>${activity.name}</h4>
                      <p>${activity.location.address || ''}</p>
                      <p>时间: ${activity.start_time} - ${activity.end_time}</p>
                      <p>费用: ¥${activity.cost}</p>
                    </div>
                  `,
                });

                marker.on('click', () => {
                  infoWindow.open(mapInstance, marker.getPosition());
                });

                markers.push(marker);
                mapInstance.add(marker);
              }
            });
          });

          // 添加住宿标记
          plan.itinerary.accommodation?.forEach((hotel) => {
            if (hotel.location.latitude && hotel.location.longitude) {
              const marker = new window.AMap.Marker({
                position: [hotel.location.longitude, hotel.location.latitude],
                title: hotel.name,
              });

              const infoWindow = new window.AMap.InfoWindow({
                content: `
                  <div style="padding: 10px;">
                    <h4>🏨 ${hotel.name}</h4>
                    <p>${hotel.location.address || ''}</p>
                    <p>入住: ${hotel.check_in}</p>
                    <p>退房: ${hotel.check_out}</p>
                    <p>费用: ¥${hotel.cost}</p>
                  </div>
                `,
              });

              marker.on('click', () => {
                infoWindow.open(mapInstance, marker.getPosition());
              });

              markers.push(marker);
              mapInstance.add(marker);
            }
          });

          // 自动调整地图视野以包含所有标记
          if (markers.length > 0) {
            mapInstance.setFitView();
          }
        }
      } catch (err: any) {
        console.error('Map initialization error:', err);
        setError('地图加载失败，请检查高德地图 API 配置');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [plan]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载地图中...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty description={error} />
      </Card>
    );
  }

  if (!plan.itinerary) {
    return (
      <Card>
        <Empty description="暂无地图数据" />
      </Card>
    );
  }

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '600px',
        }}
      />
      <div style={{ padding: '16px', background: '#fafafa' }}>
        <p style={{ margin: 0, color: '#666' }}>
          📍 点击标记查看详细信息
        </p>
      </div>
    </Card>
  );
}
