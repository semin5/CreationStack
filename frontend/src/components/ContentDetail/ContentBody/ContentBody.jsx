import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ContentBody.module.css';

const ContentBody = ({ content, thumbnailUrl }) => {
  // ReactMarkdown이 렌더링할 HTML 요소들에 대한 커스텀 컴포넌트 정의
  // 각 요소에 styles.markdownContent를 적용하여 CSS 모듈 사용
  const components = {
    // 모든 HTML 요소에 styles.markdownContent를 적용하는 대신,
    // 필요한 특정 요소에만 스타일을 적용하거나,
    // 전역 CSS를 통해 ReactMarkdown이 생성하는 기본 태그에 스타일을 적용하는 것이 일반적입니다.
    // 여기서는 `div`로 감싸고, 그 div에 클래스를 적용하는 방식으로 변경합니다.
    // 또는, `ContentBody.module.css`에서 직접 `h1`, `p`, `ul` 등에 `.contentWrapper h1`과 같이 스타일을 정의하는 것이 더 효율적입니다.

    // 현재 styles.markdownContent는 .contentWrapper 안에 있으므로,
    // .contentWrapper 내부의 마크다운 요소들에 직접 스타일을 적용하는 것이 더 좋습니다.
    // 예를 들어, ContentBody.module.css에서 다음과 같이 정의:
    // .contentWrapper h1 { ... }
    // .contentWrapper p { ... }
    // .contentWrapper ul { ... }
    // ...

    // 만약 ReactMarkdown이 생성하는 최상위 div에 클래스를 적용하고 싶다면,
    // ReactMarkdown 컴포넌트 자체에 `wrapper` prop을 사용하거나,
    // ReactMarkdown을 <div className={styles.markdownContent}>로 감싸는 것이 더 이상적입니다.
    // 여기서는 styles.markdownContent를 contentWrapper에 적용했으므로,
    // ReactMarkdown 자체에는 className을 제거합니다.
  };

  return (
    <div className={styles.contentBodyContainer}>
      {thumbnailUrl && (
        <div className={styles.thumbnailWrapper}>
          <img src={thumbnailUrl} alt="Content Thumbnail" className={styles.thumbnailImage} />
        </div>
      )}
      <div className={styles.contentWrapper}>
        {/* className prop을 ReactMarkdown 컴포넌트에서 제거합니다. */}
        {/* 대신, styles.contentWrapper 내부에 마크다운 내용이 렌더링되므로, */}
        {/* ContentBody.module.css에서 .contentWrapper 내부의 마크다운 요소에 직접 스타일을 적용합니다. */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown 지원
          components={components} // 커스텀 컴포넌트 (현재는 비워두어 기본 렌더링 사용)
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ContentBody;
