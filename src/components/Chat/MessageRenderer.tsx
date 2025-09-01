import React from 'react';

interface Citation {
  title: string;
  content: string;
  url: string;
  text_used: string;
}

interface MessageRendererProps {
  output: string;
  citations?: Citation[];
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ output, citations }) => {
  return (
    <div>
      <p className="text-blue-700 whitespace-pre-wrap">{output}</p>
      {citations && citations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h5 className="text-blue-800 font-semibold mb-2">Citations:</h5>
          <ul className="list-disc list-inside text-sm text-blue-600">
            {citations.map((citation, index) => (
              <li key={index} className="mb-1">
                <a 
                  href={citation.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  {citation.title}
                </a>
                : "{citation.text_used}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessageRenderer;
