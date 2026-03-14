import { useState } from 'react';
import Navigation from './components/Navigation';
import ChatPage from './pages/ChatPage';
import EmotionRecordsPage from './pages/EmotionRecordsPage';
import EmotionTrendsPage from './pages/EmotionTrendsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('chat');

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'records':
        return <EmotionRecordsPage />;
      case 'trends':
        return <EmotionTrendsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-warm-gray-50">
      {/* 顶部标题 */}
      <div className="bg-warm-white shadow-card px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-medium text-gray-700">AI疗愈助手</div>
          </div>
        </div>
      </div>

      {/* 导航栏 */}
      <div className="bg-warm-white shadow-sm px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* 页面内容 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;