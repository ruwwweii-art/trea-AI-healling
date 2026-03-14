function Navigation({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'chat', label: '对话' },
    { id: 'records', label: '记录' },
    { id: 'trends', label: '趋势' },
  ];

  return (
    <div className="bg-warm-white shadow-card px-8 py-4">
      <div className="max-w-4xl mx-auto flex gap-6 justify-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`px-8 py-3 rounded-full transition-all font-medium ${
              currentPage === item.id
                ? 'bg-gentle-blue-100 text-white shadow-button hover:shadow-glow'
                : 'text-gray-500 hover:bg-cream-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navigation;