"use client";

import type { CourseBlock, CourseSection } from "@/lib/courses/types";

const BLOCK_TYPES = ["paragraph", "heading", "list", "items"] as const;
type BlockType = (typeof BLOCK_TYPES)[number];

function emptyBlock(type: BlockType): CourseBlock {
  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "heading":
      return { type: "heading", level: 3, text: "" };
    case "list":
      return { type: "list", items: [""] };
    case "items":
      return { type: "items", items: [{ title: "", description: "" }] };
  }
}

function BlockEditor({
  block,
  index,
  onChange,
  onRemove,
}: {
  block: CourseBlock;
  index: number;
  onChange: (block: CourseBlock) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border border-surface/80 bg-background/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Block {index + 1} · {block.type}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[10px] uppercase text-cream/50 hover:text-orange"
        >
          Remove block
        </button>
      </div>

      {block.type === "paragraph" && (
        <textarea
          className="form-field min-h-20 text-sm"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Paragraph text"
        />
      )}

      {block.type === "heading" && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="form-field sm:w-28"
            value={block.level}
            onChange={(e) =>
              onChange({
                ...block,
                level: Number(e.target.value) as 2 | 3,
              })
            }
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            className="form-field flex-1"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Heading text"
          />
        </div>
      )}

      {block.type === "list" && (
        <textarea
          className="form-field min-h-24 font-mono text-xs"
          value={block.items.join("\n")}
          onChange={(e) =>
            onChange({
              ...block,
              items: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="One list item per line"
        />
      )}

      {block.type === "items" && (
        <div className="flex flex-col gap-3">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex flex-col gap-2 border border-surface/60 p-2">
              <input
                className="form-field text-sm"
                value={item.title}
                onChange={(e) => {
                  const items = [...block.items];
                  items[itemIndex] = { ...item, title: e.target.value };
                  onChange({ ...block, items });
                }}
                placeholder="Title"
              />
              <textarea
                className="form-field min-h-16 text-sm"
                value={item.description}
                onChange={(e) => {
                  const items = [...block.items];
                  items[itemIndex] = { ...item, description: e.target.value };
                  onChange({ ...block, items });
                }}
                placeholder="Description"
              />
              <button
                type="button"
                onClick={() => {
                  const items = block.items.filter((_, i) => i !== itemIndex);
                  onChange({ ...block, items: items.length ? items : [{ title: "", description: "" }] });
                }}
                className="self-start font-mono text-[10px] uppercase text-cream/50 hover:text-orange"
              >
                Remove item
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { title: "", description: "" }],
              })
            }
            className="self-start font-mono text-[10px] uppercase text-orange"
          >
            + Add item
          </button>
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onRemove,
}: {
  section: CourseSection;
  onChange: (section: CourseSection) => void;
  onRemove: () => void;
}) {
  const updateBlock = (blockIndex: number, block: CourseBlock) => {
    const blocks = [...section.blocks];
    blocks[blockIndex] = block;
    onChange({ ...section, blocks });
  };

  const removeBlock = (blockIndex: number) => {
    onChange({
      ...section,
      blocks: section.blocks.filter((_, i) => i !== blockIndex),
    });
  };

  return (
    <div className="flex flex-col gap-3 border border-orange/30 bg-surface/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-orange">
          Section: {section.id || "(no id)"}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[10px] uppercase text-cream/50 hover:text-orange"
        >
          Remove section
        </button>
      </div>
      <label className="font-dm text-xs text-cream/70">
        Section ID
        <input
          className="form-field mt-1 font-mono text-xs"
          value={section.id}
          onChange={(e) => onChange({ ...section, id: e.target.value })}
          placeholder="e.g. curriculum, intro, structure"
        />
      </label>
      <label className="font-dm text-xs text-cream/70">
        Section title
        <input
          className="form-field mt-1"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Content blocks
        </p>
        {section.blocks.map((block, blockIndex) => (
          <BlockEditor
            key={blockIndex}
            block={block}
            index={blockIndex}
            onChange={(b) => updateBlock(blockIndex, b)}
            onRemove={() => removeBlock(blockIndex)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              onChange({ ...section, blocks: [...section.blocks, emptyBlock(type)] })
            }
            className="border border-surface px-2 py-1 font-mono text-[10px] uppercase text-cream/70 hover:border-orange hover:text-orange"
          >
            + {type}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CourseSectionsEditorProps {
  sections: CourseSection[];
  onChange: (sections: CourseSection[]) => void;
}

export default function CourseSectionsEditor({
  sections,
  onChange,
}: CourseSectionsEditorProps) {
  const updateSection = (index: number, section: CourseSection) => {
    const next = [...sections];
    next[index] = section;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
        Page sections (intro, structure, curriculum, audience, etc.)
      </p>
      {sections.map((section, index) => (
        <SectionEditor
          key={`${section.id}-${index}`}
          section={section}
          onChange={(s) => updateSection(index, s)}
          onRemove={() => onChange(sections.filter((_, i) => i !== index))}
        />
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...sections,
            {
              id: `section-${sections.length + 1}`,
              title: "New section",
              blocks: [{ type: "paragraph", text: "" }],
            },
          ])
        }
        className="self-start border border-orange px-3 py-1.5 font-mono text-[10px] uppercase text-orange"
      >
        + Add section
      </button>
    </div>
  );
}
