/**
 * File Explorer (from Retell AI recruiter)
 *
 * Create a file explorer component using the nested data structure below.
 * Users should be able to expand and collapse folders.
 *
 * Requirements:
 * 1. Render the file tree from the nested data.
 * 2. Folders can be expanded/collapsed by clicking them.
 * 3. Files are leaf nodes — they cannot be expanded.
 * 4. Indent nested items to visually show depth.
 * 5. Show a folder/file indicator (e.g. folder icon or arrow for folders).
 */

import { useState } from "react";

import styles from "./FileExplorer.module.css";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

const fileSystemData: FileNode[] = [
  {
    id: "1",
    name: "src",
    type: "folder",
    children: [
      {
        id: "2",
        name: "components",
        type: "folder",
        children: [{ id: "3", name: "FileExplorer.js", type: "file" }],
      },
      { id: "4", name: "App.js", type: "file" },
      { id: "5", name: "index.js", type: "file" },
    ],
  },
  { id: "6", name: "package.json", type: "file" },
  { id: "7", name: "README.md", type: "file" },
];

const FileItem = ({ name, children }: FileNode) => {
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return (
      <div className={styles.parent}>
        <button className={styles.name} onClick={() => setIsOpen(!isOpen)}>
          <span>{isOpen ? "▼" : "▶"}</span>
          <span>{name}</span>
        </button>
        {isOpen && (
          <div className={styles.nestedChildren}>
            {children.map((child) => (
              <FileItem key={child.id} {...child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className={styles.leaf}>{name}</div>;
};

export const FileExplorer = () => {
  return (
    <div>
      <p>File Explorer</p>
      <div className={styles.explorer}>
        {fileSystemData.map((child) => (
          <FileItem key={child.id} {...child} />
        ))}
      </div>
    </div>
  );
};
