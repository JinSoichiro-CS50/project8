
// 檢測字串是否包含中文字符
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

// 根據中英文規則格式化姓名顯示
export function formatDisplayName(firstName: string, lastName: string): string {
  // 如果名字或姓氏包含中文，顯示 lastName + firstName
  if (containsChinese(firstName) || containsChinese(lastName)) {
    return `${lastName} ${firstName}`;
  }
  // 如果是全英文，顯示 firstName + lastName
  return `${firstName} ${lastName}`;
}
