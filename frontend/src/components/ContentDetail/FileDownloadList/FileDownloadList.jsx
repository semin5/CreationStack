import React from 'react';
import styles from './FileDownloadList.module.css'; // FileDownloadList.module.css 임포트

const FileDownloadList = ({ files }) => {
  if (!files || files.length === 0) {
    return null; // 파일이 없으면 렌더링하지 않음
  }

  return (
    <div className={styles.fileDownloadListContainer}>
      {files.map((file, index) => (
        <div key={index} className={styles.fileItem}>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.fileName}>
            {file.name || `첨부파일 ${index + 1}`} {/* 파일 이름이 없으면 기본 이름 */}
          </a>
          <a href={file.url} download={file.name || `첨부파일_${index + 1}`} className={styles.downloadButton}>
            다운로드
          </a>
        </div>
      ))}
    </div>
  );
};

export default FileDownloadList;
