import React, { useState, useRef, useEffect } from 'react';
import styles from './contentForm.module.css'; // contentForm.module.css 임포트
import { useNavigate } from 'react-router-dom';
// Toast UI Editor imports
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's default style

// API 함수 임포트
import { createContent } from '../../api/contentAPI'; // 경로에 맞게 수정
import { uploadEditorImage } from '../../api/imageAPI'; // 경로에 맞게 수정

const ContentFormPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]); // 첨부파일
  const [thumbnailFile, setThumbnailFile] = useState(null); // 썸네일 이미지 파일
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null); // 썸네일 미리보기 URL 상태 추가
  const [isDragging, setIsDragging] = useState(false); // 드래그 중인지 여부
  const [isImageUploading, setIsImageUploading] = useState(false); // 이미지 업로드 중 상태 추가
  

  // 드롭다운 외부 클릭 감지를 위한 ref
  const dropdownRef = useRef(null);
  // Toast UI Editor 인스턴스에 접근하기 위한 ref
  const editorRef = useRef(null);
  // 드래그앤드롭 영역 ref
  const dragAreaRef = useRef(null);
  // 썸네일 input ref 추가
  const thumbnailInputRef = useRef(null);

  /// ---------- 카테고리 드롭다운 관련

  const categories = ['개발', '디자인', '데이터', '기획', '커리어'];

  // 카테고리 선택 핸들러 (다중 선택 토글)
  const handleCategorySelect = category => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // 이미 선택된 카테고리라면 제거
        return prev.filter(c => c !== category);
      } else {
        // 선택되지 않은 카테고리라면 추가
        return [...prev, category];
      }
    });
    // 선택 후 드롭다운을 닫지 않음 (사용자 요청 반영)
  };

  // 선택된 카테고리 태그 제거 핸들러
  const removeCategoryTag = categoryToRemove => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryToRemove));
  };

  // 드롭다운 외부 클릭 시 닫히는 로직
  useEffect(() => {
    const handleClickOutside = event => {
      // 드롭다운이 열려 있고, 클릭된 요소가 드롭다운 내부에 포함되지 않는 경우 닫기
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    // mousedown 이벤트 리스너 추가
    document.addEventListener('mousedown', handleClickOutside);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]); // dropdownRef가 변경될 때마다 useEffect 재실행 (초기 렌더링 시 한 번만 실행)

  // ------------ 파일 업로드 핸들러
  const handleFileUpload = event => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      setAttachedFiles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(), // 고유 ID 생성
          name: file.name,
          file: file, // 실제 파일 객체도 저장
        },
      ]);
    });
  };

  // 파일 삭제 핸들러
  const removeFile = fileId => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // ----------- 썸네일 이미지
  // 썸네일 파일 변경 시 URL 생성 및 해제 로직
  useEffect(() => {
    if (thumbnailFile) {
      // 추가: thumbnailFile이 File 또는 Blob 인스턴스인지 명확히 확인
      if (!(thumbnailFile instanceof File) && !(thumbnailFile instanceof Blob)) {
        console.error('thumbnailFile이 File 또는 Blob 객체가 아닙니다:', thumbnailFile);
        setThumbnailPreviewUrl(null); // 유효하지 않은 타입이면 미리보기 URL 초기화
        return; // 오류 방지를 위해 실행 중단
      }

      const newUrl = URL.createObjectURL(thumbnailFile);
      setThumbnailPreviewUrl(newUrl);

      // cleanup 함수: 컴포넌트 언마운트 또는 thumbnailFile 변경 시 이전 URL 해제
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
      // thumbnailFile이 null이 되면 미리보기 URL도 null로 설정
      setThumbnailPreviewUrl(null);
    }
  }, [thumbnailFile]); // thumbnailFile이 변경될 때마다 이 훅 실행

  // 썸네일 파일 업로드 핸들러 (drag-and-drop 및 input change)
  const handleThumbnailUpload = file => {
    console.log('handleThumbnailUpload: 파일 선택됨', file);
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      console.warn('이미지 파일만 업로드할 수 있습니다.', file);
      setThumbnailFile(null); // 이미지 파일이 아니면 썸네일 상태를 null로 명확히 설정
    }
    // 파일 입력 필드 값 초기화 (동일 파일 재선택 가능하게 하거나, 상태 초기화 보장)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleRemoveThumbnail = () => {
    // 썸네일 상태 초기화
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null); // 혹시 useEffect 타이밍 안 맞을 경우를 대비해서 명시적 해제

    // input 요소도 초기화 (동일 파일 다시 선택 가능하게)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  // 드래그 오버 이벤트 핸들러
  const handleDragOver = e => {
    e.preventDefault(); // 기본 동작 방지 (파일 열림 방지)
    e.stopPropagation();
    setIsDragging(true);
  };

  // 드래그 리브 이벤트 핸들러
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 드롭 이벤트 핸들러
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleThumbnailUpload(files[0]); // 첫 번째 파일만 썸네일로 처리
    }
  };

  // Toast UI Editor 이미지 업로드 훅
  const onUploadImage = async (blob, callback) => {
    setIsImageUploading(true); // 이미지 업로드 시작
    try {
      // 분리된 API 함수 호출
      const result = await uploadEditorImage(blob);
      // 백엔드에서 반환된 이미지 URL을 에디터에 전달
      callback(result.imageUrl, '이미지'); // 두 번째 인자는 alt text
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message); // 사용자에게 알림
    } finally {
      setIsImageUploading(false); // 이미지 업로드 완료 (성공 또는 실패)
    }
  };

  // --------------- 콘텐츠 저장/작성취소

  // 저장 버튼 핸들러
  const handleSave = async () => {
    let markdownContent = '';
    if (editorRef.current) {
      const editorInstance = editorRef.current.getInstance();
      markdownContent = editorInstance.getMarkdown();
    }

    // AccessType 매핑
    const accessType = isSubscriberOnly ? 'SUBSCRIBER' : 'FREE';

    // 필수 입력 필드 유효성 검사
    if (!title.trim()) {
      console.warn('제목을 입력해주세요.');
      alert('제목을 입력해주세요.');
      return;
    }
    if (!markdownContent.trim()) {
      console.warn('내용을 입력해주세요.');
      alert('내용을 입력해주세요.');
      return;
    }
    if (!thumbnailFile) {
      console.warn('썸네일 이미지를 등록해주세요.');
      alert('썸네일 이미지를 등록해주세요.');
      return;
    }
    if (selectedCategories.length === 0) {
      // 카테고리 미입력 시 경고 추가
      console.warn('카테고리를 1개 이상 선택해주세요.');
      alert('카테고리를 1개 이상 선택해주세요.');
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', markdownContent);
    formData.append('accessType', accessType);

    // 카테고리 추가 (여러 개일 경우 동일한 키로 여러 번 append)
    selectedCategories.forEach(category => {
      formData.append('categoryNames', category);
    });

    // 썸네일 파일 추가
    if (thumbnailFile) {
      formData.append('thumbnailFile', thumbnailFile);
    }

    // 첨부 파일 추가 (수정된 부분)
    if (attachedFiles.length > 0) {
      // 첨부 파일이 있을 때만 FormData에 추가
      attachedFiles.forEach(item => {
        if (item.file) {
          formData.append('attachmentFiles', item.file);
        } else {
          console.warn('Attached file item is missing the actual file object:', item);
        }
      });
    }

    try {
      const result = await createContent(formData);
      console.log('콘텐츠 저장 성공:', result);
      alert('콘텐츠가 성공적으로 저장되었습니다!');
      // 저장 성공 후 폼 초기화 또는 다른 페이지로 이동
      navigate(`/content/${result.contentId}`); // 저장 후 상세 페이지로 이동
    } catch (error) {
      console.error('콘텐츠 저장 실패:', error);
      alert('콘텐츠 저장에 실패했습니다: ' + error.message);
    }
  };

  // 작성 취소 버튼 핸들러
  const handleCancel = () => {
    console.log('작성 취소');
    setTitle('');
    setContent('');
    setIsSubscriberOnly(false);
    setSelectedCategories([]);
    setAttachedFiles([]);
    setThumbnailFile(null); // 썸네일 파일 초기화
    if (editorRef.current) {
      editorRef.current.getInstance().setMarkdown('');
    }
    // 썸네일 input 필드 값 초기화
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.contentFormPageContainer}>
      {' '}
      {/* 새로운 클래스 적용 */}
      {/* 상단 토글 및 카테고리 섹션 */}
      <div className={styles.selectionSection}>
        {/* 토글 스위치*/}
        <div className={styles.toggleWrapper}>
          <label
            className={styles.toggleLabelContainer}
            onClick={() => setIsSubscriberOnly(prev => !prev)} // label 클릭 시 상태 토글
          >
            {/* 토글 스위치 시각적 요소 */}
            <div className={`${styles.toggleSwitch} ${isSubscriberOnly ? styles.toggleSwitchActive : ''}`}>
              <div className={styles.toggleSwitchHandle}></div>
            </div>
            <span className={styles.toggleLabel}>구독자 전용</span>
          </label>
        </div>

        {/* 카테고리 드롭다운 */}
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          {' '}
          {/* ref 연결 */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.dropdownHovered}
            aria-expanded={isDropdownOpen} // 접근성을 위해 aria-expanded 속성 추가
          >
            <div className={styles.overlapGroup}>
              <span className={styles.selectedText}>
                {selectedCategories.length > 0 ? '카테고리 선택됨' : '카테고리'}{' '}
                {/* 선택된 카테고리가 있으면 텍스트 변경 */}
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
              {categories.map(category => (
                <button key={category} onClick={() => handleCategorySelect(category)} className={styles.listItem}>
                  <div
                    className={`${styles.checkBox} ${
                      selectedCategories.includes(category) ? styles.checkBoxActive : ''
                    }`}>
                    {selectedCategories.includes(category) && (
                      <svg className={styles.checkMarkIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {/* 모든 카테고리에 styles.optionText를 적용하여 로직 단순화 */}
                  <span className={styles.optionText}>{category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* 선택된 카테고리 태그 표시 영역 */}
      <div className={styles.selectedCategoryTags}>
        {selectedCategories.map(category => (
          <div key={category} className={styles.categoryTag}>
            <span className={styles.categoryTagText}>{category}</span>
            <button onClick={() => removeCategoryTag(category)} className={styles.removeTagButton}>
              ×
            </button>
          </div>
        ))}
      </div>
      {/* 제목 입력 섹션 */}
      <div className={styles.titleInput}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className={styles.labelText} // placeholder 텍스트에 스타일 적용
        />
        <div className={styles.line}></div> {/* 제목 입력 하단 라인 */}
      </div>
      {/* 콘텐츠 입력 영역 - Toast UI Editor로 대체 */}
      <div className={styles.editorArea}>
        {' '}
        {/* editorArea는 컨테이너 스타일링을 위해 유지 */}
        <Editor
          ref={editorRef}
          initialValue={content} // content 상태를 초기값으로 사용
          placeholder="내용을 입력하세요"
          previewStyle="vertical" // 'vertical' 또는 'tab'
          height="300px" // 에디터 높이 설정
          initialEditType="wysiwyg" // 'wysiwyg' 또는 'markdown'
          // 에디터 툴바 아이템 설정
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
      {/* 썸네일 이미지 영역 */}
      <div
        className={`${styles.dragAndDropArea} ${isDragging ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={dragAreaRef}>
        <div className={styles.dragAndDropContent}>
          {thumbnailPreviewUrl ? (
            <img src={thumbnailPreviewUrl} alt="Thumbnail Preview" className={styles.thumbnailPreview} />
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
            key={thumbnailFile ? 'has-thumbnail' : 'no-thumbnail'}
            type="file"
            onChange={e => handleThumbnailUpload(e.target.files[0])}
            className="hidden"
            id="thumbnail-upload"
            accept="image/*"
          />
          <label htmlFor="thumbnail-upload" className={styles.fileSelectButton}>
            썸네일 등록
          </label>
          {thumbnailFile && (
            <button type="button" className={styles.removeThumbnailButton} onClick={handleRemoveThumbnail}>
              썸네일 삭제
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
          <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label
            htmlFor="file-upload"
            className={styles.fileSelectButton} // 파란색 버튼 하나만 남기도록 이 클래스 사용
          >
            파일 선택
          </label>
        </div>

        {/* 파일 목록 */}
        <div className={styles.fileItemListWrapper}>
          <div className={styles.fileItemList}>
            {attachedFiles.length > 0 ? (
              attachedFiles.map(file => (
                <div key={file.id} className={styles.fileItem}>
                  <span className={styles.fileTitleText}>{file.name}</span>
                  <button onClick={() => removeFile(file.id)} className={styles.deleteButton}>
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

export default ContentFormPage;
