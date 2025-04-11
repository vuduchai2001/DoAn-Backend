export const modelName = 'gpt-4o-mini'
export const modelNameTokens = 'gpt-4o-mini'
export const embeddingModel = 'text-embedding-3-small'
export const temperature = 0.1

export const generatePrompt = (service: string) => {
  return `
  Bạn là một chuyên gia giáo dục giỏi trong việc biên soạn bài giảng chi tiết và khoa học. Hãy giúp tôi viết một bài giảng chi tiết về chủ đề: "${service}".
  
  Yêu cầu:

    * Bài giảng chia thành các chương/mục rõ ràng: Lý thuyết, công thức (nếu có), ví dụ minh họa, ứng dụng thực tế, bài tập vận dụng.

    * Trình bày logic, dễ hiểu như giáo viên giảng bài cho học sinh/sinh viên.

    * Có thể chèn mã LaTeX cho công thức nếu cần.

    * Giọng văn thân thiện, khuyến khích người học.

    * Độ dài bài giảng khoảng 1000-2000 từ (có thể nhiều hơn nếu cần để đầy đủ ý).

  Hãy bắt đầu với:
    Tiêu đề bài giảng:
    Mục lục:
    I. Giới thiệu
    II. Nội dung chính
    III. Ứng dụng thực tế
    IV. Bài tập
    V. Tổng kết
  `
}
