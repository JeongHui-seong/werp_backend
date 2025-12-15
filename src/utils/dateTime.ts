/**
 * UTC 시간을 Asia/Seoul 시간대로 변환하는 함수
 * UTC에 9시간을 더한 Date 객체를 반환합니다.
 * @param date UTC 시간 Date 객체
 * @returns Asia/Seoul 시간대로 변환된 Date 객체 (UTC+9)
 */
export function convertToAsiaSeoul(date: Date | null): Date | null {
    if (!date) {
        return null;
    }
    
    // UTC 시간에 9시간(32400000 밀리초)을 더해서 Asia/Seoul 시간으로 변환
    const offset = 9 * 60 * 60 * 1000; // UTC+9 (9시간을 밀리초로 변환)
    return new Date(date.getTime() + offset);
}

