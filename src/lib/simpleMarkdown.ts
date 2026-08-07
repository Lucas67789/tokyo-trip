/**
 * 간단한 마크다운 → HTML 변환기 (네이버 SEO용 콘텐츠 렌더링)
 * H2, H3, 불릿 리스트, 번호 리스트, 볼드, 이탤릭, 단락 지원
 */
export function simpleMarkdown(text: string): string {
  if (!text) return "";

  const lines = text.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html.push("</ul>"); inUl = false; }
    if (inOl) { html.push("</ol>"); inOl = false; }
  };

  const applyInline = (s: string) =>
    s
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<span class="block relative w-full my-4"><img src="$2" alt="$1" class="w-full max-h-[600px] object-contain rounded-xl shadow-sm border border-slate-200 bg-slate-50" /></span>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded text-sm font-mono">$1</code>');

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3 class="text-base font-extrabold text-slate-800 mt-5 mb-2">${applyInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2 class="text-lg font-extrabold text-slate-900 mt-7 mb-3 border-b border-slate-100 pb-2">${applyInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inUl) { closeList(); html.push('<ul class="list-disc pl-5 space-y-1 my-3 text-slate-700">'); inUl = true; }
      html.push(`<li class="text-sm leading-relaxed">${applyInline(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (!inOl) { closeList(); html.push('<ol class="list-decimal pl-5 space-y-1 my-3 text-slate-700">'); inOl = true; }
      html.push(`<li class="text-sm leading-relaxed">${applyInline(line.replace(/^\d+\.\s/, ""))}</li>`);
    } else {
      closeList();
      html.push(`<p class="text-sm text-slate-700 leading-relaxed my-2">${applyInline(line)}</p>`);
    }
  }
  closeList();

  const result = html.join("\n");

  // SEO 보정: alt 속성이 없거나 비어있는 <img> 태그에 대체 텍스트 자동 삽입
  return ensureImgAlt(result);
}

/**
 * HTML 문자열 내의 <img> 태그에 alt 속성이 누락되거나 비어있으면 자동 보정합니다.
 * 네이버 서치어드바이저 SEO 경고(Alt 속성 누락) 방지용.
 */
export function ensureImgAlt(html: string): string {
  if (!html) return "";
  return html
    // alt 속성이 아예 없는 <img> 태그에 alt 추가
    .replace(/<img(?![^>]*\balt\s*=)([^>]*)\/?>/gi, '<img alt="관련 이미지"$1 />')
    // alt="" 처럼 비어있는 경우 보정
    .replace(/<img([^>]*)\balt\s*=\s*""([^>]*)\/?>/gi, '<img$1alt="관련 이미지"$2 />');
}
