// src/api/imageApi.js


// Toast UI Editor에서 이미지를 업로드하는 API 호출 함수
export async function uploadEditorImage(imageBlob) {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob); // 'image'는 백엔드 컨트롤러의 @RequestParam 이름과 일치해야 합니다.

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('에디터 이미지 업로드 API 호출 실패:', error);
    throw error; // 호출자에게 에러를 다시 던집니다.
  }
}
