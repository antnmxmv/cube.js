import React, { useEffect, useState } from 'react';

const GitHubCodeBlock = (props: propsType) => {
  const { href, titleSuffixCount, part, lang } = props;
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const { user, repo, branch, filePath, title } = parseHref(
      href,
      titleSuffixCount
    );

    setTitle(title);
    fetchCodeFromGitHub(
      `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`,
      setCode,
      part
    );
  }, []);

  return (
    <div>
      <h4>{title}</h4>
      <pre>
        <code className={`language-${lang}`}>{code}</code>
      </pre>
    </div>
  );
};

export default GitHubCodeBlock;

function parseHref(href: string, titleSuffixCount: number): parseHref {
  const stringWithOutGitHubSlug = href.replace('https://github.com/', '');
  const arrayOfStringData = stringWithOutGitHubSlug.split('/');
  const user = arrayOfStringData?.[0] || null;
  const repo = arrayOfStringData?.[1] || null;
  const branch = arrayOfStringData?.[3] || null;
  const title =
    [...arrayOfStringData]
      ?.reverse()
      ?.splice(0, titleSuffixCount)
      ?.reverse()
      ?.join('/') || '';
  const filePath = arrayOfStringData?.splice(4)?.join('/') || null;

  return { user, repo, branch, filePath, title };
}

async function fetchCodeFromGitHub(
  url: string,
  setCode: (text: string) => void,
  part: string | null
) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      let code = await response.text();

      if (!part) {
        setCode(code);
      } else {
        setCode(spliceCodeByPart(code, part));
      }
    }
    highlightCode();
  } catch (e) {
    console.log(e);
  }
}

function highlightCode(): void {
  window.Prism && window.Prism.highlightAll();
}

function spliceCodeByPart(code: string, value: string): string {
  if (!value) {
    return code;
  }
  const start = [
    `<!-- start part: ${value} -->`,
    `// start part: ${value}`,
    `# start part: ${value}`,
  ];
  const end = [
    `<!-- end part: ${value} -->`,
    `// end part: ${value}`,
    `# end part: ${value}`,
  ];

  start.forEach((startLine) => {
    const startIndex = code.indexOf(startLine);
    if (startIndex !== -1) {
      end.forEach((endLine) => {
        const endIndex = code.indexOf(endLine);
        if (endIndex !== -1) {
          code = code?.slice(startIndex + startLine.length, endIndex)?.trim()
        }
      });
    }
  });

  return code;
}

interface propsType {
  href: string;
  titleSuffixCount: number;
  part: string | null;
  lang: string;
}
interface parseHref {
  [key: string]: string | null;
  title: string;
}
