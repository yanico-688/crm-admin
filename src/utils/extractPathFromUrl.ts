/**
 * Extracts the path from a given URL, optionally removing the leading slash.
 * @param urlString The URL from which to extract the path.
 * @param removeLeadingSlash Indicates whether to remove the leading slash from the path. Defaults to true.
 * @returns The extracted path from the URL.
 */
const extractPathFromUrl = (urlString: string, removeLeadingSlash: boolean = true): string => {
  try {
    const parsedUrl = new URL(urlString);
    let pathname = parsedUrl.pathname;

    // If requested, remove the leading slash from the pathname
    if (removeLeadingSlash && pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }

    return pathname;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return ''; // Return an empty string or handle it as you see fit
  }
};

// Example usage
export default extractPathFromUrl;

export interface PermissionItem {
  code: string;
  name: string;
  category: string;
}

export function extractPermissions(routes: any[], parentName = ''): PermissionItem[] {
  const result: PermissionItem[] = [];

  routes.forEach(route => {
    const { name, access, routes: children, component } = route;

    const hasChildren = Array.isArray(children) && children.length > 0;
    const category = parentName || name || '未分类';

    // ✅ 只收集有 access 且有页面 component 的作为权限项
    if (access && name && component) {
      result.push({
        code: access,
        name,
        category,
      });
    }

    // 递归处理子路由
    if (hasChildren) {
      result.push(...extractPermissions(children, name || parentName));
    }
  });

  return result;
}

