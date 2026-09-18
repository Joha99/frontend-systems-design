export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export const FILE_TREE: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: [
          { id: "src/components/Button.tsx", label: "Button.tsx" },
          { id: "src/components/Modal.tsx", label: "Modal.tsx" },
          { id: "src/components/Sidebar.tsx", label: "Sidebar.tsx" },
          { id: "src/components/Table.tsx", label: "Table.tsx" },
        ],
      },
      {
        id: "src/hooks",
        label: "hooks",
        children: [
          { id: "src/hooks/useAuth.ts", label: "useAuth.ts" },
          { id: "src/hooks/useFetch.ts", label: "useFetch.ts" },
          { id: "src/hooks/useLocalStorage.ts", label: "useLocalStorage.ts" },
        ],
      },
      {
        id: "src/pages",
        label: "pages",
        children: [
          { id: "src/pages/Home.tsx", label: "Home.tsx" },
          { id: "src/pages/Dashboard.tsx", label: "Dashboard.tsx" },
          { id: "src/pages/Settings.tsx", label: "Settings.tsx" },
        ],
      },
      { id: "src/App.tsx", label: "App.tsx" },
      { id: "src/index.ts", label: "index.ts" },
    ],
  },
  {
    id: "public",
    label: "public",
    children: [
      { id: "public/favicon.ico", label: "favicon.ico" },
      { id: "public/index.html", label: "index.html" },
      {
        id: "public/assets",
        label: "assets",
        children: [
          { id: "public/assets/logo.svg", label: "logo.svg" },
          { id: "public/assets/hero.png", label: "hero.png" },
        ],
      },
    ],
  },
  { id: "package.json", label: "package.json" },
  { id: "tsconfig.json", label: "tsconfig.json" },
  { id: "README.md", label: "README.md" },
];
