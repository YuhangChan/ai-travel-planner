import { useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Space, message, Divider, Tag } from 'antd';

declare global {
  interface Window {
    AMap: any;
  }
}

/**
 * 高德地图调试工具组件
 * 用于测试高德地图API的各种功能
 */
export default function AmapDebugTool() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [geocodeAddress, setGeocodeAddress] = useState('');
  const [testCity, setTestCity] = useState('北京');

  useEffect(() => {
    if (!mapContainer.current) return;

    console.group('🛠️ 高德地图调试工具初始化');

    if (!window.AMap) {
      console.error('❌ window.AMap 不存在');
      message.error('高德地图API未加载');
      console.groupEnd();
      return;
    }

    console.log('✅ window.AMap 存在');
    console.log('  版本:', window.AMap.version);

    try {
      const mapInstance = new window.AMap.Map(mapContainer.current, {
        zoom: 13,
        center: [116.397428, 39.90923], // 北京天安门
        viewMode: '3D',
      });

      console.log('✅ 地图实例创建成功');
      setMap(mapInstance);

      // 添加默认测试标记
      const testMarker = new window.AMap.Marker({
        position: [116.397428, 39.90923],
        title: '测试标记 - 天安门',
      });
      mapInstance.add(testMarker);
      console.log('✅ 默认测试标记已添加');

      console.groupEnd();
    } catch (err) {
      console.error('❌ 地图初始化失败:', err);
      message.error('地图初始化失败');
      console.groupEnd();
    }

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // 测试1: 手动添加标记
  const handleAddMarker = () => {
    if (!map) {
      message.error('地图未初始化');
      return;
    }

    console.group('🧪 测试1: 手动添加标记');

    const testCoordinates = [
      { name: '北京天安门', position: [116.397428, 39.90923] },
      { name: '上海东方明珠', position: [121.499763, 31.239666] },
      { name: '广州塔', position: [113.324520, 23.109630] },
    ];

    const randomIndex = Math.floor(Math.random() * testCoordinates.length);
    const test = testCoordinates[randomIndex];

    console.log('添加标记:', test.name, test.position);

    try {
      const marker = new window.AMap.Marker({
        position: test.position,
        title: test.name,
      });

      map.add(marker);
      map.setCenter(test.position);

      console.log('✅ 标记添加成功');
      message.success(`已添加标记: ${test.name}`);
    } catch (err) {
      console.error('❌ 标记添加失败:', err);
      message.error('标记添加失败');
    }

    console.groupEnd();
  };

  // 测试2: 地点搜索 (PlaceSearch)
  const handlePlaceSearch = () => {
    if (!map || !window.AMap) {
      message.error('地图未初始化');
      return;
    }

    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    console.group('🧪 测试2: 地点搜索 (PlaceSearch)');
    console.log('搜索关键词:', searchKeyword);
    console.log('搜索城市:', testCity);

    try {
      const placeSearch = new window.AMap.PlaceSearch({
        pageSize: 10,
        pageIndex: 1,
        city: testCity,
      });

      console.log('PlaceSearch实例创建成功');

      placeSearch.search(searchKeyword, (status: string, result: any) => {
        console.log('搜索状态:', status);
        console.log('搜索结果:', result);

        if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
          const pois = result.poiList.pois;
          console.log(`✅ 找到 ${pois.length} 个地点:`);

          pois.forEach((poi: any, index: number) => {
            console.log(`  [${index}] ${poi.name}`);
            console.log(`      地址: ${poi.address}`);
            console.log(`      坐标: [${poi.location.lng}, ${poi.location.lat}]`);
            console.log(`      类型: ${poi.type}`);

            // 在地图上添加标记
            const marker = new window.AMap.Marker({
              position: [poi.location.lng, poi.location.lat],
              title: poi.name,
            });

            const infoWindow = new window.AMap.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h4>${poi.name}</h4>
                  <p>${poi.address || ''}</p>
                  <p>类型: ${poi.type || ''}</p>
                  <p style="font-size: 12px; color: #999;">
                    坐标: ${poi.location.lng}, ${poi.location.lat}
                  </p>
                </div>
              `,
            });

            marker.on('click', () => {
              infoWindow.open(map, marker.getPosition());
            });

            map.add(marker);
          });

          // 移动到第一个结果
          const firstPoi = pois[0];
          map.setCenter([firstPoi.location.lng, firstPoi.location.lat]);
          map.setZoom(15);

          message.success(`找到 ${pois.length} 个地点，已添加标记`);
        } else {
          console.warn('⚠️ 未找到相关地点');
          message.warning('未找到相关地点');
        }

        console.groupEnd();
      });
    } catch (err) {
      console.error('❌ 地点搜索失败:', err);
      message.error('地点搜索失败');
      console.groupEnd();
    }
  };

  // 测试3: 地理编码 (Geocoder)
  const handleGeocode = () => {
    if (!window.AMap) {
      message.error('地图未初始化');
      return;
    }

    if (!geocodeAddress.trim()) {
      message.warning('请输入地址');
      return;
    }

    console.group('🧪 测试3: 地理编码 (Geocoder)');
    console.log('输入地址:', geocodeAddress);
    console.log('城市:', testCity);

    try {
      const geocoder = new window.AMap.Geocoder({
        city: testCity,
      });

      console.log('Geocoder实例创建成功');

      geocoder.getLocation(geocodeAddress, (status: string, result: any) => {
        console.log('地理编码状态:', status);
        console.log('地理编码结果:', result);

        if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
          const geocode = result.geocodes[0];
          const location = geocode.location;

          console.log('✅ 地理编码成功:');
          console.log('  地址:', geocode.formattedAddress);
          console.log('  经度:', location.lng);
          console.log('  纬度:', location.lat);

          // 添加标记
          const marker = new window.AMap.Marker({
            position: [location.lng, location.lat],
            title: geocode.formattedAddress,
          });

          map.add(marker);
          map.setCenter([location.lng, location.lat]);
          map.setZoom(16);

          message.success(`坐标: [${location.lng}, ${location.lat}]`);
        } else {
          console.warn('⚠️ 地理编码失败');
          message.warning('地理编码失败，请检查地址');
        }

        console.groupEnd();
      });
    } catch (err) {
      console.error('❌ 地理编码错误:', err);
      message.error('地理编码错误');
      console.groupEnd();
    }
  };

  // 测试4: 逆地理编码
  const handleReverseGeocode = () => {
    if (!map || !window.AMap) {
      message.error('地图未初始化');
      return;
    }

    console.group('🧪 测试4: 逆地理编码 (点击地图获取地址)');
    message.info('请在地图上点击任意位置');

    const clickHandler = (e: any) => {
      const { lng, lat } = e.lnglat;
      console.log('点击坐标:', [lng, lat]);

      const geocoder = new window.AMap.Geocoder();

      geocoder.getAddress([lng, lat], (status: string, result: any) => {
        console.log('逆地理编码状态:', status);
        console.log('逆地理编码结果:', result);

        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress;
          console.log('✅ 地址:', address);

          // 添加标记
          const marker = new window.AMap.Marker({
            position: [lng, lat],
            title: address,
          });

          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h4>逆地理编码结果</h4>
                <p>${address}</p>
                <p style="font-size: 12px; color: #999;">
                  坐标: ${lng}, ${lat}
                </p>
              </div>
            `,
          });

          marker.on('click', () => {
            infoWindow.open(map, marker.getPosition());
          });

          map.add(marker);
          message.success('已获取地址信息');
        }

        console.groupEnd();
        // 移除点击监听
        map.off('click', clickHandler);
      });
    };

    map.on('click', clickHandler);
  };

  // 清除所有标记
  const handleClearMarkers = () => {
    if (!map) return;

    console.log('🧹 清除所有标记');
    map.clearMap();
    message.success('已清除所有标记');

    // 重新添加默认测试标记
    const testMarker = new window.AMap.Marker({
      position: [116.397428, 39.90923],
      title: '测试标记 - 天安门',
    });
    map.add(testMarker);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="🛠️ 高德地图调试工具" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 基本信息 */}
          <div>
            <h4>🔍 API 状态检查</h4>
            <Space>
              <Tag color={window.AMap ? 'success' : 'error'}>
                window.AMap: {window.AMap ? '已加载' : '未加载'}
              </Tag>
              {window.AMap && (
                <Tag color="blue">版本: {window.AMap.version}</Tag>
              )}
              <Tag color={map ? 'success' : 'warning'}>
                地图实例: {map ? '已创建' : '未创建'}
              </Tag>
            </Space>
          </div>

          <Divider />

          {/* 测试1: 手动添加标记 */}
          <div>
            <h4>🧪 测试1: 手动添加标记</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              随机添加一个测试标记（北京/上海/广州）
            </p>
            <Button type="primary" onClick={handleAddMarker}>
              添加随机测试标记
            </Button>
          </div>

          <Divider />

          {/* 测试2: 地点搜索 */}
          <div>
            <h4>🧪 测试2: 地点搜索 (PlaceSearch)</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              测试高德PlaceSearch API，搜索地点并显示坐标
            </p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="输入城市"
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                style={{ width: 200 }}
              />
              <Space>
                <Input
                  placeholder="输入地点名称，如：天安门"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={handlePlaceSearch}
                  style={{ width: 300 }}
                />
                <Button type="primary" onClick={handlePlaceSearch}>
                  搜索地点
                </Button>
              </Space>
              <div style={{ fontSize: 12, color: '#999' }}>
                💡 提示：先尝试搜索 "天安门"、"故宫"、"长城" 等知名景点
              </div>
            </Space>
          </div>

          <Divider />

          {/* 测试3: 地理编码 */}
          <div>
            <h4>🧪 测试3: 地理编码 (Geocoder)</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              将地址转换为经纬度坐标
            </p>
            <Space>
              <Input
                placeholder="输入地址，如：北京市朝阳区"
                value={geocodeAddress}
                onChange={(e) => setGeocodeAddress(e.target.value)}
                onPressEnter={handleGeocode}
                style={{ width: 300 }}
              />
              <Button type="primary" onClick={handleGeocode}>
                地理编码
              </Button>
            </Space>
          </div>

          <Divider />

          {/* 测试4: 逆地理编码 */}
          <div>
            <h4>🧪 测试4: 逆地理编码</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              点击地图获取该位置的地址信息
            </p>
            <Button type="primary" onClick={handleReverseGeocode}>
              启用点击获取地址
            </Button>
          </div>

          <Divider />

          {/* 清除按钮 */}
          <div>
            <Button danger onClick={handleClearMarkers}>
              清除所有标记
            </Button>
          </div>
        </Space>
      </Card>

      {/* 地图容器 */}
      <Card title="📍 地图预览" styles={{ body: { padding: 0 } }}>
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '600px',
          }}
        />
        <div style={{ padding: '16px', background: '#fafafa' }}>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
            💡 打开浏览器开发者工具 (F12) 查看详细的调试日志
          </p>
        </div>
      </Card>
    </div>
  );
}
