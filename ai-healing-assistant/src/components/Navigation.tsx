interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'chat', label: '对话' },
    { id: 'records', label: '记录' },
    { id: 'trends', label: '趋势' },
  ];

  return (
    <div className="bg-white shadow-sm px-6 py-3">
      <div className="max-w-4xl mx-auto flex gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`px-6 py-2 rounded-lg transition-all ${
              currentPage === item.id
                ? 'bg-haze-blue-100 text-gray-700'
                : 'text-gray-500 hover:bg-beige-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}