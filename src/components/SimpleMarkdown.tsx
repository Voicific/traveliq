import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = text.split(/\n\n+/);

  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 my-4 text-gray-300">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  blocks.forEach((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('## ')) {
      flushList(`list-${i}`);
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-brand-light">
          {trimmed.slice(3)}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`);
      elements.push(
        <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-brand-light">
          {trimmed.slice(4)}
        </h3>
      );
      return;
    }

    if (trimmed === '---') {
      flushList(`list-${i}`);
      elements.push(<hr key={i} className="border-cyan-400/20 my-8" />);
      return;
    }

    // Bullet list block (lines starting with "- ")
    const lines = trimmed.split('\n');
    if (lines.every(l => l.startsWith('- '))) {
      flushList(`list-pre-${i}`);
      lines.forEach(l => listItems.push(l.slice(2)));
      flushList(`list-${i}`);
      return;
    }

    flushList(`list-${i}`);
    elements.push(
      <p key={i} className="mb-4">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList('list-end');

  return <>{elements}</>;
};

export default SimpleMarkdown;
