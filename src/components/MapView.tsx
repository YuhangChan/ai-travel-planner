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
    console.log('🔄 MapView useEffect 触发');
    console.log('  mapContainer.current:', mapContainer.current);
    console.log('  plan:', plan);

    if (!mapContainer.current) {
      console.error('❌ mapContainer.current 为 null');
      setLoading(false);
      setError('地图容器未能正确初始化');
      return;
    }

    const initMap = () => {
      try {
        console.group('🗺️ 高德地图初始化开始');

        // ===== DEBUG 步骤1: 检查高德地图 API 是否加载 =====
        console.log('步骤1: 检查高德地图API加载状态');
        console.log('  window.AMap 存在:', !!window.AMap);
        if (window.AMap) {
          console.log('  高德地图版本:', window.AMap.version);
        }

        if (!window.AMap) {
          console.error('❌ 高德地图 API 未加载');
          setError('高德地图 API 未加载，请检查配置');
          setLoading(false);
          console.groupEnd();
          return;
        }
        console.log('✅ 高德地图API加载成功');

        // ===== DEBUG 步骤2: 检查行程数据 =====
        console.log('\n步骤2: 检查行程数据');
        console.log('  plan对象:', plan);
        console.log('  plan.itinerary存在:', !!plan.itinerary);

        if (plan.itinerary) {
          const totalDays = plan.itinerary.days?.length || 0;
          const totalActivities = plan.itinerary.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0;
          const totalAccommodation = plan.itinerary.accommodation?.length || 0;

          console.log('  总天数:', totalDays);
          console.log('  总活动数:', totalActivities);
          console.log('  总住宿数:', totalAccommodation);
        }

        // 创建地图实例
        console.log('\n步骤3: 创建地图实例');
        const mapInstance = new window.AMap.Map(mapContainer.current, {
          zoom: 12,
          center: [116.397428, 39.90923], // 默认北京
          viewMode: '2D', // 使用 2D 视图模式
        });
        console.log('✅ 地图实例创建成功');
        console.log('  地图中心:', mapInstance.getCenter());
        console.log('  地图缩放:', mapInstance.getZoom());

        setMap(mapInstance);
        setLoading(false);

        // ===== DEBUG 步骤4: 添加标记点 =====
        if (plan.itinerary) {
          console.log('\n步骤4: 开始添加标记点');
          const markers: any[] = [];
          let validLocationCount = 0;
          let invalidLocationCount = 0;

          // 添加景点标记
          console.log('\n  📍 处理活动标记:');
          plan.itinerary.days.forEach((day, dayIndex) => {
            console.log(`    Day ${day.day} (${day.date}): ${day.activities?.length || 0} 个活动`);

            day.activities?.forEach((activity, actIndex) => {
              const hasLat = activity.location?.latitude !== undefined && activity.location?.latitude !== null;
              const hasLng = activity.location?.longitude !== undefined && activity.location?.longitude !== null;

              console.log(`      [${dayIndex}-${actIndex}] ${activity.name}:`);
              console.log(`        地点信息:`, activity.location);
              console.log(`        经度: ${activity.location?.longitude} (${hasLng ? '✅' : '❌'})`);
              console.log(`        纬度: ${activity.location?.latitude} (${hasLat ? '✅' : '❌'})`);

              if (hasLat && hasLng) {
                const lng = activity.location.longitude!;
                const lat = activity.location.latitude!;

                // 验证坐标范围（中国境内）
                const isValidRange = lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
                console.log(`        坐标范围检查: ${isValidRange ? '✅ 在中国境内' : '❌ 超出中国范围'}`);
                console.log(`        坐标值: [${lng}, ${lat}]`);

                try {
                  const marker = new window.AMap.Marker({
                    position: [lng, lat],
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
                        <p style="font-size: 12px; color: #999;">坐标: ${lng}, ${lat}</p>
                      </div>
                    `,
                  });

                  marker.on('click', () => {
                    infoWindow.open(mapInstance, marker.getPosition());
                  });

                  markers.push(marker);
                  mapInstance.add(marker);
                  validLocationCount++;
                  console.log(`        ✅ 标记添加成功`);
                } catch (markerErr) {
                  console.error(`        ❌ 标记添加失败:`, markerErr);
                  invalidLocationCount++;
                }
              } else {
                invalidLocationCount++;
                console.warn(`        ⚠️ 坐标缺失，跳过该活动`);
              }
            });
          });

          // 添加住宿标记
          console.log('\n  🏨 处理住宿标记:');
          plan.itinerary.accommodation?.forEach((hotel, hotelIndex) => {
            const hasLat = hotel.location?.latitude !== undefined && hotel.location?.latitude !== null;
            const hasLng = hotel.location?.longitude !== undefined && hotel.location?.longitude !== null;

            console.log(`    [${hotelIndex}] ${hotel.name}:`);
            console.log(`      地点信息:`, hotel.location);
            console.log(`      经度: ${hotel.location?.longitude} (${hasLng ? '✅' : '❌'})`);
            console.log(`      纬度: ${hotel.location?.latitude} (${hasLat ? '✅' : '❌'})`);

            if (hasLat && hasLng) {
              const lng = hotel.location.longitude!;
              const lat = hotel.location.latitude!;

              const isValidRange = lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
              console.log(`      坐标范围检查: ${isValidRange ? '✅ 在中国境内' : '❌ 超出中国范围'}`);
              console.log(`      坐标值: [${lng}, ${lat}]`);

              try {
                const marker = new window.AMap.Marker({
                  position: [lng, lat],
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
                      <p style="font-size: 12px; color: #999;">坐标: ${lng}, ${lat}</p>
                    </div>
                  `,
                });

                marker.on('click', () => {
                  infoWindow.open(mapInstance, marker.getPosition());
                });

                markers.push(marker);
                mapInstance.add(marker);
                validLocationCount++;
                console.log(`      ✅ 标记添加成功`);
              } catch (markerErr) {
                console.error(`      ❌ 标记添加失败:`, markerErr);
                invalidLocationCount++;
              }
            } else {
              invalidLocationCount++;
              console.warn(`      ⚠️ 坐标缺失，跳过该住宿`);
            }
          });

          // 统计信息
          console.log('\n步骤5: 标记添加统计');
          console.log(`  ✅ 成功添加: ${validLocationCount} 个标记`);
          console.log(`  ❌ 失败/跳过: ${invalidLocationCount} 个标记`);
          console.log(`  📊 总标记数: ${markers.length}`);

          // 自动调整地图视野以包含所有标记
          if (markers.length > 0) {
            console.log('\n步骤6: 调整地图视野');
            mapInstance.setFitView();
            console.log('  ✅ 地图视野已调整到包含所有标记');
            console.log('  新的地图中心:', mapInstance.getCenter());
            console.log('  新的地图缩放:', mapInstance.getZoom());
          } else {
            console.warn('  ⚠️ 没有有效标记，地图保持默认视野');
          }
        } else {
          console.warn('⚠️ 没有行程数据，跳过标记添加');
        }

        console.log('\n✅ 地图初始化完成');
        console.groupEnd();

      } catch (err: any) {
        console.error('❌ 地图初始化错误:', err);
        console.error('  错误详情:', err.message);
        console.error('  错误堆栈:', err.stack);
        console.groupEnd();
        setError('地图加载失败，请检查高德地图 API 配置');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (map) {
        console.log('🗺️ 销毁地图实例');
        map.destroy();
      }
    };
  }, [plan]);

  // 始终渲染地图容器，只是根据状态显示不同的遮罩层
  return (
    <Card bodyStyle={{ padding: 0 }}>
      {/* 地图容器 - 使用相对定位以便放置遮罩层 */}
      <div
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      >
        {/* 实际的地图div - 始终渲染以确保ref能正确绑定 */}
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Loading遮罩 */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载地图中...</div>
          </div>
        )}

        {/* Error遮罩 */}
        {!loading && error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <Empty description={error} />
          </div>
        )}

        {/* 无数据遮罩 */}
        {!loading && !error && !plan.itinerary && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <Empty description="暂无地图数据" />
          </div>
        )}
      </div>

      <div style={{ padding: '16px', background: '#fafafa' }}>
        <p style={{ margin: 0, color: '#666' }}>
          📍 点击标记查看详细信息
        </p>
      </div>
    </Card>
  );
}
