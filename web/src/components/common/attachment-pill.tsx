import { CloudDownload, FileTerminal, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { convertKBToGB } from '@/lib/utils/helpers';
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { BiMusic, BiVideoRecording, BiFile, BiFileBlank } from 'react-icons/bi';
import { AiOutlineFileExcel, AiOutlineFilePdf, AiOutlineFileWord, AiOutlineFilePpt } from 'react-icons/ai';
import { GrDocumentZip } from 'react-icons/gr';

interface Props {
  filename: any;
  filesize: number;
  filetype: string;
  file: string | null;
  isDownloaded?: boolean;
  onDownloadRequest?: (showPreview?: boolean) => Promise<{ success: boolean; fileUrl: string | null; showPreview: boolean }>;
}

const AttachmentPill = ({
  filename,
  filesize,
  filetype,
  file,
  isDownloaded = false,
  onDownloadRequest,
}: Props) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  
  // File type checks
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(filetype.toLowerCase());
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(filetype.toLowerCase());
  const isAudio = ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(filetype.toLowerCase());
  const isPdf = filetype.toLowerCase() === 'pdf';
  const isWord = ['doc', 'docx', 'rtf'].includes(filetype.toLowerCase());
  const isExcel = ['xls', 'xlsx', 'csv'].includes(filetype.toLowerCase());
  const isPowerPoint = ['ppt', 'pptx'].includes(filetype.toLowerCase());
  const isText = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(filetype.toLowerCase());
  const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(filetype.toLowerCase());
  
  // Determine which files can be previewed in browser
  const canPreview = isVideo || isPdf || isAudio || isText;
  
  // Reset preview state when modal closes
  useEffect(() => {
    if (!showPreviewModal) {
      setPreviewReady(false);
    }
  }, [showPreviewModal]);
  
  // Function to ensure filename has the correct extension
  const ensureFileExtension = (name: string, type: string): string => {
    if (!type) return name;
    const extension = type.toLowerCase().replace(/^\./, '');
    if (name.toLowerCase().endsWith(`.${extension}`)) {
      return name;
    }
    return `${name}.${extension}`;
  };

  // Simple download function
  const downloadFile = (url: string) => {
    try {
      const properFilename = ensureFileExtension(filename, filetype);
      const link = document.createElement('a');
      link.href = url;
      link.download = properFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  // Handle preview button click
  const handlePreview = async () => {
    // If already downloaded, show preview directly
    if (file) {
      setPreviewUrl(file);
      setShowPreviewModal(true);
      setTimeout(() => setPreviewReady(true), 300);
      return;
    }
    
    // Otherwise, show loading state and fetch
    setShowPreviewModal(true);
    setPreviewReady(false);
    
    if (onDownloadRequest) {
      setIsDownloading(true);
      try {
        const result = await onDownloadRequest(true);
        if (result.success && result.fileUrl) {
          setPreviewUrl(result.fileUrl);
          setTimeout(() => setPreviewReady(true), 300);
        } else {
          setTimeout(() => setShowPreviewModal(false), 1000);
        }
      } catch (error) {
        console.error("Error loading preview:", error);
        setTimeout(() => setShowPreviewModal(false), 1000);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Handle download button click
  const handleDownload = async () => {
    // If already downloaded, download directly
    if (file) {
      downloadFile(file);
      return;
    }
    
    // Otherwise, fetch and download
    if (onDownloadRequest) {
      setIsDownloading(true);
      try {
        const result = await onDownloadRequest(false);
        if (result.success && result.fileUrl) {
          downloadFile(result.fileUrl);
        }
      } catch (error) {
        console.error("Error downloading:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const getFileIcon = (filetype: string) => {
    if (isPdf) return <AiOutlineFilePdf size="24px" className="text-red-600" />;
    if (isWord) return <AiOutlineFileWord size="24px" className="text-blue-700" />;
    if (isExcel) return <AiOutlineFileExcel size="24px" className="text-green-700" />;
    if (isPowerPoint) return <AiOutlineFilePpt size="24px" className="text-orange-600" />;
    if (isVideo) return <BiVideoRecording size="24px" className="text-purple-600" />;
    if (isAudio) return <BiMusic size="24px" className="text-yellow-600" />;
    if (isArchive) return <GrDocumentZip size="24px" className="text-gray-700" />;
    if (isText) return <BiFileBlank size="24px" className="text-gray-600" />;
    if (filetype === 'bash') return <FileTerminal size="24px" className="text-gray-700" />;
    return <BiFile size="24px" className="text-gray-600" />;
  };

  const renderPreviewContent = () => {
    if (!previewUrl || !previewReady) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <video 
          key={`video-${Date.now()}`}
          src={previewUrl}
          controls 
          controlsList="nodownload"
          disablePictureInPicture
          autoPlay
          className="w-full h-full max-h-[80vh]" 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      );
    } else if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-900 p-8 rounded-lg">
          <div className="text-white mb-4 text-xl">{filename}</div>
          <audio 
            controls 
            autoPlay
            className="w-full max-w-md" 
            src={previewUrl}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    } else if (isPdf) {
      return (
        <iframe 
          src={`${previewUrl}#toolbar=0`} 
          className="w-full h-full border-none" 
          style={{ width: '100%', height: '100%' }}
          title={`PDF Preview: ${filename}`}
        />
      );
    } else if (isText) {
      return (
        <iframe 
          src={previewUrl} 
          className="w-full h-full border-none" 
          style={{ width: '100%', height: '100%' }}
          title={`Text Preview: ${filename}`}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
          <div className="text-white mb-4">
            This file type cannot be previewed directly in the browser. Please download the file to view it.
          </div>
          <Button 
            onClick={() => downloadFile(previewUrl)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2"
          >
            <CloudDownload size="18px" />
            Download {filename}
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <div className="flex justify-between items-center py-2 px-4 w-[360px] border border-gray-200 rounded-md shadow-[4px_6px_26px_12px_#1C57EE0F]">
          <div className="flex gap-3 items-center overflow-hidden">
            {getFileIcon(filetype)}
            <div className="text-sm overflow-hidden">
              <p className="truncate max-w-[240px]" title={filename}>{filename}</p>
              <p className="text-slate-400 text-xs">{convertKBToGB(filesize)}</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-1 flex-shrink-0">
            {/* Download button */}
            <Button 
              title="Download" 
              variant="ghost" 
              size="sm" 
              onClick={handleDownload}
              disabled={isDownloading}
              className="hover:bg-blue-50"
            >
              <CloudDownload className={`${isDownloading ? "text-gray-200" : "text-blue-500"}`} size="18px" />
            </Button>
            
            {/* Preview button */}
            {canPreview && (
              <Button
                title={file ? "Preview" : "Download & Preview"}
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                disabled={isDownloading}
                className="hover:bg-purple-50"
              >
                <Eye 
                  className={`${isDownloading ? "text-gray-200" : file ? "text-purple-500" : "text-purple-400"}`} 
                  size="18px" 
                />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog 
        open={showPreviewModal} 
        onOpenChange={setShowPreviewModal}
      >
        <DialogTitle className="sr-only">File Preview</DialogTitle>
        <DialogContent
          className="max-w-none w-screen h-screen m-0 p-0"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
            }
          }}
        >
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700"
                onClick={() => previewUrl && downloadFile(previewUrl)}
                disabled={!previewUrl || !previewReady}
              >
                <CloudDownload size="18px" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700"
                onClick={() => setShowPreviewModal(false)}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
            <div className="w-[90%] h-[90%] flex items-center justify-center">
              {renderPreviewContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttachmentPill;
