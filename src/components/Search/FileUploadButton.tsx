// src/components/Search/FileUploadButton.tsx
import React, { useRef, useState } from 'react';
import { Button, Icon } from '../UI';
import { UploadedFile } from '../../types';

interface FileUploadButtonProps {
  onFileUpload: (file: UploadedFile) => void;
  onFileRemove: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFiles,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['.txt', '.pdf', '.doc', '.docx', '.md'],
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeInBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      return `Supported file types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          
          // For now, we'll handle text files directly
          // For other formats, we'd need to implement specific parsers
          if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            resolve(result);
          } else if (file.type === 'application/pdf') {
            // For PDF files, we would need a PDF parser library
            // For now, we'll show an info message
            resolve(`[PDF Content] - File: ${file.name}\nNote: PDF content extraction not yet implemented. Please convert to text format for now.`);
          } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            // For Word documents, we would need a document parser
            resolve(`[Word Document] - File: ${file.name}\nNote: Word document content extraction not yet implemented. Please convert to text format for now.`);
          } else {
            // Try to read as text for other formats
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Failed to extract text from file: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError('');

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      // Extract text content from file
      const content = await extractTextFromFile(file);

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
        uploadedAt: new Date()
      };

      onFileUpload(uploadedFile);
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Upload button */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || isProcessing}
        className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 flex-shrink-0 min-w-[120px]"
        title="Upload file"
      >
        <Icon 
          name={isProcessing ? "loading" : "attachment"} 
          size="sm" 
          className={isProcessing ? 'animate-spin' : ''} 
        />
        <span className="text-sm font-medium">
          {isProcessing ? 'Processing...' : 'Upload'}
        </span>
        {uploadedFiles.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>

      {/* Error message */}
      {uploadError && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs whitespace-nowrap z-10">
          {uploadError}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="absolute top-full left-0 mt-1 min-w-80 max-w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
              <span className="text-xs text-gray-500">{uploadedFiles.length} file(s)</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <Icon name="file" size="sm" className="mr-2 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Remove file"
                  >
                    <Icon name="x" size="sm" className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Files will be used as context for AI responses
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadButton;
