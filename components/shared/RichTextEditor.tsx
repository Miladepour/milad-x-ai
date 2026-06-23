"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { EmailButton } from "@/lib/tiptap/email-button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeightClassName?: string;
  enableLink?: boolean;
  enableEmailButton?: boolean;
}

type ToolPanel = "link" | "button" | null;

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Write lesson materials…",
  minHeightClassName = "min-h-[160px]",
  enableLink = false,
  enableEmailButton = false,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Learn more");
  const [buttonUrl, setButtonUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      ...(enableLink || enableEmailButton
        ? [
            Link.configure({
              openOnClick: false,
              HTMLAttributes: {
                rel: "noopener noreferrer",
                target: "_blank",
                class: "text-orange underline",
              },
            }),
            EmailButton,
          ]
        : []),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: `${minHeightClassName} rounded-sm border-0 bg-transparent p-3 font-dm text-sm leading-relaxed text-cream focus:outline-none prose-email-editor`,
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

  function insertLink() {
    if (!editor) return;
    const url = normalizeUrl(linkUrl);
    if (!url) return;

    const { from, to, empty } = editor.state.selection;
    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }

    setLinkUrl("");
    setToolPanel(null);
  }

  function insertEmailButton() {
    if (!editor) return;
    const href = normalizeUrl(buttonUrl);
    const label = buttonLabel.trim();
    if (!href || !label) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "emailButton",
        attrs: { href, label },
      })
      .run();

    setButtonLabel("Learn more");
    setButtonUrl("");
    setToolPanel(null);
  }

  const btnClass =
    "border border-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange hover:text-orange disabled:opacity-40";

  const btnAccentClass =
    "border border-orange px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-40";

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
        {enableLink && (
          <button
            type="button"
            className={toolPanel === "link" ? btnAccentClass : btnClass}
            onClick={() => setToolPanel((panel) => (panel === "link" ? null : "link"))}
          >
            Link
          </button>
        )}
        {enableEmailButton && (
          <button
            type="button"
            className={toolPanel === "button" ? btnAccentClass : btnClass}
            onClick={() => setToolPanel((panel) => (panel === "button" ? null : "button"))}
          >
            Button
          </button>
        )}
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

      {toolPanel === "link" && (
        <div className="flex flex-col gap-2 border-b border-surface/80 px-3 py-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 font-dm text-xs text-cream/70">
            Link URL
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="form-field mt-1"
              placeholder="https://miladxai.com/..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertLink();
                }
              }}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setToolPanel(null)} className={btnClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={insertLink}
              disabled={!linkUrl.trim()}
              className={btnAccentClass}
            >
              Insert link
            </button>
          </div>
        </div>
      )}

      {toolPanel === "button" && (
        <div className="flex flex-col gap-2 border-b border-surface/80 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="min-w-[140px] flex-1 font-dm text-xs text-cream/70">
            Button label
            <input
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              className="form-field mt-1"
              placeholder="Learn more"
            />
          </label>
          <label className="min-w-[200px] flex-[2] font-dm text-xs text-cream/70">
            Button URL
            <input
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
              className="form-field mt-1"
              placeholder="https://miladxai.com/..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertEmailButton();
                }
              }}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setToolPanel(null)} className={btnClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={insertEmailButton}
              disabled={!buttonLabel.trim() || !buttonUrl.trim()}
              className={btnAccentClass}
            >
              Insert button
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
      <style jsx global>{`
        .prose-email-editor a[data-email-button="true"] {
          display: inline-block;
          background-color: #ff5c00;
          color: #ffffff !important;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
        }
        .prose-email-editor p:has(> a[data-email-button="true"]) {
          text-align: center;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}
