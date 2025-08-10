import React, { useState, useRef, useCallback } from 'react';
import { Bed, Armchair, Monitor, Coffee, Bath, User } from 'lucide-react';

const HotelRoomDesigner = () => {
  const [items, setItems] = useState([
    { id: 1, type: 'yatak', x: 100, y: 150, icon: Bed, color: 'bg-blue-200', label: 'Yatak' },
    { id: 2, type: 'koltuk', x: 300, y: 200, icon: Armchair, color: 'bg-green-200', label: 'Koltuk' },
    { id: 3, type: 'tv', x: 200, y: 50, icon: Monitor, color: 'bg-gray-200', label: 'TV' },
    { id: 4, type: 'masa', x: 400, y: 100, icon: Coffee, color: 'bg-yellow-200', label: 'Masa' },
    { id: 5, type: 'banyo', x: 50, y: 300, icon: Bath, color: 'bg-purple-200', label: 'Banyo' },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const roomRef = useRef(null);

  // Alternative 1: nativeEvent.offsetX/Y kullanımı
  const handleMouseDownV1 = useCallback((e:any, item:any) => {
    e.preventDefault();
    
    // offsetX/Y elementi içindeki relatif pozisyon verir
    const offsetX = e.nativeEvent?.offsetX || 0;
    const offsetY = e.nativeEvent?.offsetY || 0;
    
    setDraggedItem(item.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  }, []);

  // Alternative 2: Event target kullanımı
  const handleMouseDownV2 = useCallback((e:any, item:any) => {
    e.preventDefault();
    
    const target = e.currentTarget;
    const rect = {
      left: target.offsetLeft || 0,
      top: target.offsetTop || 0
    };
    
    const offsetX = e.pageX - rect.left;
    const offsetY = e.pageY - rect.top;
    
    setDraggedItem(item.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  }, []);

  // Ana drag başlatma fonksiyonu (getBoundingClientRect kullanmadan)
  const handleMouseDown = useCallback((e:any, item:any) => {
    e.preventDefault();
    
    // Basit offset hesaplama
    const itemElement = e.currentTarget;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Element pozisyonunu al
    let elementX = item.x;
    let elementY = item.y;
    
    // Mouse ile element arasındaki farkı hesapla
    const offsetX = mouseX - elementX;
    const offsetY = mouseY - elementY;
    
    setDraggedItem(item.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    console.log('Drag başladı:', { mouseX, mouseY, elementX, elementY });
  }, []);

  // Basitleştirilmiş mouse move
  const handleMouseMove = useCallback((e:any) => {
    if (!isDragging || !draggedItem) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Yeni pozisyon hesaplama (offset çıkarılarak)
    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;
    
    // Sabit sınırlar (oda boyutu varsayımı)
    const roomWidth = 800;  // Oda genişliği
    const roomHeight = 600; // Oda yüksekliği
    const itemSize = 80;    // Item boyutu
    
    // Sınırları kontrol et
    newX = Math.max(0, Math.min(newX, roomWidth - itemSize));
    newY = Math.max(0, Math.min(newY, roomHeight - itemSize));
    
    // Item pozisyonunu güncelle
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === draggedItem
          ? { ...item, x: newX, y: newY }
          : item
      )
    );
  }, [isDragging, draggedItem, dragOffset]);

  // Mouse bırakma
  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  // Touch event'ler için (mobil destek)
  const handleTouchStart = useCallback((e:any, item:any) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    setDraggedItem(item.id);
    setDragOffset({ x: 40, y: 40 }); // Item merkezinden tut
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e:any) => {
    if (!isDragging || !draggedItem) return;
    
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;
    
    // Sınır kontrolü
    newX = Math.max(0, Math.min(newX, 720));
    newY = Math.max(0, Math.min(newY, 520));
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === draggedItem
          ? { ...item, x: newX, y: newY }
          : item
      )
    );
  }, [isDragging, draggedItem, dragOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
  }, []);

  const addNewItem = (type:any) => {
    const newItem = {
      id: Date.now(),
      type: type.name,
      x: 50,
      y: 50,
      icon: type.icon,
      color: type.color,
      label: type.label
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId:any) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const itemTypes = [
    { name: 'yatak', icon: Bed, color: 'bg-blue-200', label: 'Yatak' },
    { name: 'koltuk', icon: Armchair, color: 'bg-green-200', label: 'Koltuk' },
    { name: 'tv', icon: Monitor, color: 'bg-gray-200', label: 'TV' },
    { name: 'masa', icon: Coffee, color: 'bg-yellow-200', label: 'Masa' },
    { name: 'banyo', icon: Bath, color: 'bg-purple-200', label: 'Banyo' },
  ];

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Araç Çubuğu */}
      <div style={{
        width: '300px',
        backgroundColor: 'white',
        padding: '20px',
        borderRight: '1px solid #e5e7eb',
        boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          Mobilya Paleti
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {itemTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.name}
                onClick={() => addNewItem(type)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: type.color === 'bg-blue-200' ? '#bfdbfe' :
                                 type.color === 'bg-green-200' ? '#bbf7d0' :
                                 type.color === 'bg-gray-200' ? '#e5e7eb' :
                                 type.color === 'bg-yellow-200' ? '#fef3c7' : '#e9d5ff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <IconComponent size={24} />
                <span>{type.label} Ekle</span>
              </button>
            );
          })}
        </div>
        
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Nasıl Kullanılır:
          </h3>
          <ul style={{ fontSize: '12px', color: '#6b7280', margin: 0, padding: 0, listStyle: 'none' }}>
            <li>• Mobilya eklemek için yukarıdaki butonları kullanın</li>
            <li>• Mobilyaları sürükleyip istediğiniz yere bırakın</li>
            <li>• Mobilya üzerinde sağ tık yaparak silebilirsiniz</li>
          </ul>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Debug:</strong><br/>
          Sürüklenen: {draggedItem || 'Yok'}<br/>
          Durum: {isDragging ? 'Sürükleniyor' : 'Bekliyor'}
        </div>
      </div>

      {/* Ana Oda Alanı */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        minHeight: '100vh'
      }}>
        <div
          ref={roomRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #fbbf24 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #f59e0b 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        >
          {/* Oda Başlığı */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <User size={20} />
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Otel Odası Tasarımı
            </h1>
          </div>

          {/* Mobilyalar */}
          {items.map((item) => {
            const IconComponent = item.icon;
            const isCurrentlyDragged = draggedItem === item.id;
            
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: '80px',
                  height: '80px',
                  backgroundColor: item.color === 'bg-blue-200' ? '#bfdbfe' :
                                 item.color === 'bg-green-200' ? '#bbf7d0' :
                                 item.color === 'bg-gray-200' ? '#e5e7eb' :
                                 item.color === 'bg-yellow-200' ? '#fef3c7' : '#e9d5ff',
                  borderRadius: '12px',
                  boxShadow: isCurrentlyDragged ? '0 20px 25px rgba(0,0,0,0.25)' : '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: 'move',
                  border: '2px solid #d1d5db',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  transform: isCurrentlyDragged ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                  transition: isCurrentlyDragged ? 'none' : 'all 0.2s ease',
                  zIndex: isCurrentlyDragged ? 50 : 10,
                  pointerEvents: isDragging && !isCurrentlyDragged ? 'none' : 'auto'
                }}
                onMouseDown={(e) => handleMouseDown(e, item)}
                onTouchStart={(e) => handleTouchStart(e, item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  removeItem(item.id);
                }}
              >
                <IconComponent size={24} style={{ color: '#374151' }} />
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginTop: '4px' 
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}

          {/* Yardım Metni */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Mobilyaları sürükle & bırak ile yerleştirin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelRoomDesigner;