import React from 'react';
import ReactMarkdown from 'react-markdown';

interface CoachMarkdownProps {
  text: string;
  inverted?: boolean;
}

export default function CoachMarkdown({ text, inverted = false }: CoachMarkdownProps) {
  return (
    <div className={inverted ? 'markdown-body text-white prose-invert' : 'markdown-body'}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
