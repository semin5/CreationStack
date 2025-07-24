import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

import { getContentById, updateContent } from '../../api/contentAPI'; // 기존 콘텐츠 로드 및 업데이트 API
import { uploadEditorImage } from '../../api/imageAPI';
import styles from './contentForm.module.css'; // contentForm.module.css 임포트

const ContentEditPage = () => {
  const { contentId } = useParams(); // URL에서 contentId를 가져옴
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]); // 일반 첨부파일
  const [thumbnailFile, setThumbnailFile] = useState(null); // 새로운 썸네일 이미지 파일
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null); // 기존 썸네일 URL
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null); // 썸네일 미리보기 URL
  const [isDragging, setIsDragging] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['개발', '디자인', '데이터', '기획', '커리어'];

  const dropdownRef = useRef(null);
  const editorRef = useRef(null);
  const dragAreaRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // 콘텐츠 데이터 로드 및 폼 초기화
  useEffect(() => {
    const fetchContentData = async () => {
      if (!contentId) {
        setLoading(false);
        setError(new Error("콘텐츠 ID가 없습니다."));
        return;
      }
      try {
        setLoading(true);
        const data = await getContentById(contentId);
        setTitle(data.title);
        setContent(data.content);
        setIsSubscriberOnly(data.accessType === 'SUBSCRIBER');
        setSelectedCategories(data.categories.map(cat => cat.name));
        setExistingThumbnailUrl(data.thumbnailUrl); // 기존 썸네일 URL 설정
        setThumbnailPreviewUrl(data.thumbnailUrl); // 미리보기 URL도 기존 URL로 초기화

        // 기존 첨부파일 설정
        if (data.attachments) {
          setAttachedFiles(data.attachments.map(att => ({
            id: att.attachmentId, // 기존 파일은 ID를 사용
            name: att.originalFileName,
            file: null, // 실제 파일 객체는 없으므로 null
            isExisting: true, // 기존 파일임을 표시
            fileUrl: att.fileUrl // 파일 URL도 저장
          })));
        }

        if (editorRef.current) {
          editorRef.current.getInstance().setMarkdown(data.content);
        }
      } catch (err) {
        setError(err);
        console.error("콘텐츠 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [contentId]);

  // 썸네일 파일 변경 시 URL 생성 및 해제 로직
  useEffect(() => {
    if (thumbnailFile) {
      if (!(thumbnailFile instanceof File) && !(thumbnailFile instanceof Blob)) {
        console.error("useEffect 오류: thumbnailFile이 File 또는 Blob 객체가 아닙니다:", thumbnailFile);
        setThumbnailPreviewUrl(null);
        return;
      }
      const newUrl = URL.createObjectURL(thumbnailFile);
      setThumbnailPreviewUrl(newUrl);
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else if (existingThumbnailUrl) {
      // 새 파일이 없고 기존 URL이 있으면 기존 URL을 미리보기로 사용
      setThumbnailPreviewUrl(existingThumbnailUrl);
    } else {
      // 둘 다 없으면 미리보기 제거
      setThumbnailPreviewUrl(null);
    }
  }, [thumbnailFile, existingThumbnailUrl]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 썸네일 파일 업로드 핸들러
  const handleThumbnailUpload = file => {
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file); // 새 파일로 설정
      setExistingThumbnailUrl(null); // 새 파일이 선택되었으니 기존 URL은 무효화
    } else {
      console.warn('이미지 파일만 업로드할 수 있습니다.');
      setThumbnailFile(null);
      // 기존 썸네일 유지 여부는 여기서 결정하지 않고, 폼 제출 시 최종적으로 결정
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  // 일반 첨부파일 업로드 핸들러
  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      setAttachedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        file: file, // 실제 파일 객체 저장
        isExisting: false // 새 파일임을 표시
      }]);
    });
    event.target.value = '';
  };

  // 일반 첨부파일 삭제 핸들러
  const removeAttachment = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 드래그앤드롭 핸들러
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) { handleThumbnailUpload(files[0]); }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // 선택된 카테고리 태그 제거 핸들러
  const removeCategoryTag = (categoryToRemove) => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryToRemove));
  };

  // Toast UI Editor 이미지 업로드 훅
  const onUploadImage = async (blob, callback) => {
    setIsImageUploading(true);
    try {
      const result = await uploadEditorImage(blob);
      callback(result.imageUrl, '이미지');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    } finally {
      setIsImageUploading(false);
    }
  };

  // 저장 (수정) 버튼 핸들러
  const handleSave = async () => {
    let markdownContent = '';
    if (editorRef.current) {
      markdownContent = editorRef.current.getInstance().getMarkdown();
    }

    const accessType = isSubscriberOnly ? 'SUBSCRIBER' : 'FREE';

    // 유효성 검사
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    if (!markdownContent.trim()) { alert('내용을 입력해주세요.'); return; }
    if (!thumbnailFile && !existingThumbnailUrl) { alert('썸네일 이미지를 등록해주세요.'); return; }
    if (selectedCategories.length === 0) { alert('카테고리를 1개 이상 선택해주세요.'); return; }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', markdownContent);
    formData.append('accessType', accessType);

    selectedCategories.forEach(category => {
      formData.append('categoryNames', category);
    });

    // 썸네일 처리 로직
    if (thumbnailFile) {
      formData.append('newThumbnailFile', thumbnailFile); // 새 썸네일 파일
    } else if (existingThumbnailUrl) {
      formData.append('existingThumbnailUrl', existingThumbnailUrl); // 기존 썸네일 URL 유지
    } else {
      // 썸네일이 제거된 경우 (null 또는 빈 문자열로 백엔드에 전달)
      formData.append('existingThumbnailUrl', ''); // 명시적으로 빈 문자열 전달 (백엔드에서 null 처리 가능)
    }

    // 첨부파일 처리 로직
    const newAttachmentFiles = attachedFiles.filter(item => !item.isExisting && item.file);
    const existingAttachmentIds = attachedFiles.filter(item => item.isExisting).map(item => item.id);

    newAttachmentFiles.forEach(item => {
      formData.append('newAttachmentFiles', item.file);
    });
    existingAttachmentIds.forEach(id => {
      formData.append('existingAttachmentIds', id);
    });

    try {
      const result = await updateContent(contentId, formData); // updateContent API 호출
      console.log('콘텐츠 수정 성공:', result);
      alert('콘텐츠가 성공적으로 수정되었습니다!');
      navigate(`/content/${result.contentId}`); // 수정 후 상세 페이지로 이동
    } catch (error) {
      console.error('콘텐츠 수정 실패:', error);
      alert('콘텐츠 수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  // 작성 취소 버튼 핸들러
  const handleCancel = () => {
    navigate(`/content/${contentId}`); // 상세 페이지로 돌아가기
  };

  if (loading) {
    return <div className={styles.loadingMessage}>콘텐츠를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>콘텐츠 로드 실패: {error.message}</div>;
  }

  return (
    <div className={styles.contentFormPageContainer}>

      <div className={styles.selectionSection}>
        <div className={styles.toggleWrapper}>
          <label
            className={styles.toggleLabelContainer}
            onClick={() => setIsSubscriberOnly(prev => !prev)}
          >
            <div className={`${styles.toggleSwitch} ${isSubscriberOnly ? styles.toggleSwitchActive : ''}`}>
              <div className={styles.toggleSwitchHandle}></div>
            </div>
            <span className={styles.toggleLabel}>구독자 전용</span>
          </label>
        </div>

        <div className={styles.selectedCategoryTags}>
          {selectedCategories.map((category) => (
            <div key={category} className={styles.categoryTag}>
              <span className={styles.categoryTagText}>{category}</span>
              <button onClick={() => removeCategoryTag(category)} className={styles.removeTagButton}>
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.dropdownHovered}
            aria-expanded={isDropdownOpen}
          >
            <div className={styles.overlapGroup}>
              <span className={styles.selectedText}>
                {selectedCategories.length > 0 ? '카테고리 선택됨' : '카테고리'}
              </span>
              <div className={styles.chevrondownIcon}>
                <svg className={styles.vector} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownList}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={styles.listItem}
                >
                  <div className={`${styles.checkBox} ${selectedCategories.includes(category) ? styles.checkBoxActive : ''}`}>
                    {selectedCategories.includes(category) && (
                      <svg className={styles.checkMarkIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={styles.optionText}>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.titleInput}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className={styles.labelText}
        />
        <div className={styles.line}></div>
      </div>

      <div className={styles.editorArea}>
        <Editor
          ref={editorRef}
          initialValue={content} // 초기값 설정
          placeholder="내용을 입력하세요"
          previewStyle="vertical"
          height="300px"
          initialEditType="wysiwyg"
          toolbarItems={[
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task', 'indent', 'outdent'],
            ['table', 'image', 'link'],
            ['code', 'codeblock'],
            ['scrollSync'],
          ]}
          hooks={{
            addImageBlobHook: onUploadImage,
          }}
          onChange={() => {}}
        />
        {/* 이미지 업로드 중 로딩 인디케이터 */}
        {isImageUploading && (
          <div className={styles.imageUploadLoadingOverlay}>
            <div className={styles.spinner}></div>
            <p>이미지 업로드 중...</p>
          </div>
        )}
      </div>

      {/* 썸네일 이미지 드래그앤드롭 영역 */}
      <div
        className={`${styles.dragAndDropArea} ${isDragging ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={dragAreaRef}
      >
        <div className={styles.dragAndDropContent}>
          {thumbnailPreviewUrl ? (
            <img
              src={thumbnailPreviewUrl}
              alt="Thumbnail Preview"
              className={styles.thumbnailPreview}
            />
          ) : (
            <>
              <svg className={styles.dragAndDropIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className={styles.dragAndDropText}>drag and drop</p>
              <p className={styles.dragAndDropSubText}>썸네일 이미지는 한개만 등록 가능합니다.</p>
            </>
          )}
          <input
            type="file"
            onChange={e => handleThumbnailUpload(e.target.files[0])}
            className="hidden"
            id="thumbnail-upload"
            accept="image/*"
            ref={thumbnailInputRef}
          />
          <label htmlFor="thumbnail-upload" className={styles.fileSelectButton}>
            썸네일 등록
          </label>
          {(thumbnailFile || existingThumbnailUrl) && (
            <button type="button" className={styles.removeThumbnailButton} onClick={() => {
              setThumbnailFile(null);
              setExistingThumbnailUrl(null); // 기존 URL도 제거
              setThumbnailPreviewUrl(null); // 미리보기 URL도 제거
              if (thumbnailInputRef.current) {
                thumbnailInputRef.current.value = '';
              }
            }}>
              썸네일 제거
            </button>
          )}
        </div>
      </div>
      {/* 첨부파일 섹션 - 항상 렌더링 */}
      <div className={styles.fileSection}>
        <div className={styles.headerSection2}>
          <h3 className={styles.titleText}>첨부파일</h3>
          <div className={styles.overlapGroupWrapper}></div>
        </div>

        {/* 파일 업로드 input & 버튼 (첨부파일 섹션 내부로 이동) */}
        <div className={styles.uploadControlWrapper}>
          <input type="file" multiple onChange={handleAttachmentUpload} className="hidden" id="file-upload" />
          <label
            htmlFor="file-upload"
            className={styles.fileSelectButton}
          >
            파일 선택
          </label>
        </div>

        {/* 파일 목록 */}
        <div className={styles.fileItemListWrapper}>
          <div className={styles.fileItemList}>
            {attachedFiles.length > 0 ? (
              attachedFiles.map(item => (
                <div key={item.id} className={styles.fileItem}>
                  <span className={styles.fileTitleText}>{item.name}</span>
                  <button onClick={() => removeAttachment(item.id)} className={styles.deleteButton}>
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyFileText}>첨부된 파일이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 하단 버튼 섹션 */}
      <div className={styles.footerSection}>
        <img className={styles.img} alt="Line" src="https://c.animaapp.com/md45uvjzPxvxqT/img/line-5.svg" />
        <button onClick={handleCancel} className={styles.cancelButton}>
          <span className={styles.textWrapper2}>작성취소</span>
        </button>
        <button onClick={handleSave} className={styles.storeButton}>
          <span className={styles.textWrapper3}>저장</span>
        </button>
      </div>
    </div>
  );
};
export default ContentEditPage;
