"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeightClassName?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Write lesson materials…",
  minHeightClassName = "min-h-[160px]",
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: `${minHeightClassName} rounded-sm border-0 bg-transparent p-3 font-dm text-sm leading-relaxed text-cream focus:outline-none`,
        "data-placeholder": placeholder,
      },
    },
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "<p></p>";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  const btnClass =
    "border border-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange hover:text-orange disabled:opacity-40";

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-cream/30 bg-background/20 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/30">
      <div className="flex flex-wrap gap-2 border-b border-surface/80 p-2">
        <button
          type="button"
          className={btnClass}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
        {onImageUpload && (
          <>
            <button
              type="button"
              disabled={uploadingRef.current}
              className={`${btnClass} border-orange text-orange hover:bg-orange hover:text-background`}
              onClick={() => imageInputRef.current?.click()}
            >
              Image
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !onImageUpload) return;
                uploadingRef.current = true;
                try {
                  const url = await onImageUpload(file);
                  editor?.chain().focus().setImage({ src: url }).run();
                } finally {
                  uploadingRef.current = false;
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }
              }}
            />
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
