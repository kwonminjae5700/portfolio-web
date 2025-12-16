interface PostHeaderProps {
  title: string;
  excerpt: string;
  date: string;
}

export default function PostHeader({ title, excerpt, date }: PostHeaderProps) {
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <header className="mb-12 pb-8 border-b border-gray-200">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
        {title}
      </h1>

      <p className="text-xl text-gray-600 mb-6">{excerpt}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <time dateTime={date}>{formatDate(date)}</time>
      </div>
    </header>
  );
}
