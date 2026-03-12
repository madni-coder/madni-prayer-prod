# 🗓️ Dynamic Events / Programs System — Idea & Architecture Plan

> **Status:** Planning Phase — No API or Prisma changes yet
> **Goal:** A fully server-driven, dynamic page system where the Admin Panel controls every field, label, input type, and layout of the Events/Programs page — with zero rebuilds required.

---

## 🧠 Core Concept

The idea is a **"Page Schema" system**. Instead of hardcoding any field on the Events/Programs page, every field is defined as a **JSON schema stored on the server** (Supabase database). The frontend reads this schema at runtime and **renders the form/page dynamically**.

> Think of it like a **form-builder inside the Admin Panel** — similar to how Google Forms or Typeform lets you build forms, except this is integrated directly into our app's admin panel and powers live public pages.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                          │
│  /admin/events                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Page Builder UI                                     │   │
│  │  - Create/Rename Page (e.g. "Eid Milad Program")     │   │
│  │  - Add / Remove / Reorder Fields                     │   │
│  │  - Configure each field:                             │   │
│  │      ✦ Label (e.g. "Full Name")                      │   │
│  │      ✦ Field Key (slug, e.g. "full_name")            │   │
│  │      ✦ Field Type (text, number, dropdown, etc.)     │   │
│  │      ✦ Options (for dropdowns, radios, etc.)         │   │
│  │      ✦ Validations (required, min, max, etc.)        │   │
│  │      ✦ Placeholder / Helper Text                     │   │
│  │      ✦ Visibility Conditions (show if X = Y)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │  Save Schema (JSON)                 │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Supabase DB       │
              │  Table: page_schemas│
              │  - id               │
              │  - page_slug        │
              │  - page_title       │
              │  - schema (jsonb)   │
              │  - is_active        │
              │  - updated_at       │
              └─────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND APP                           │
│  /events/[slug]                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dynamic Page Renderer                               │   │
│  │  1. Fetch schema from API (no cache / ISR)           │   │
│  │  2. Render each field based on its type              │   │
│  │  3. Handle submit → send to API with dynamic data    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure (No API/Prisma Changes)

```
src/
├── app/
│   ├── admin/
│   │   └── events/
│   │       ├── page.js                  ← List of all event pages
│   │       └── [slug]/
│   │           └── page.js              ← Page builder (field editor)
│   │
│   └── events/
│       └── [slug]/
│           └── page.js                  ← Dynamic public-facing page
│
├── components/
│   └── dynamic-form/
│       ├── DynamicFormRenderer.js       ← Renders the full form from schema
│       ├── FieldRenderer.js             ← Renders a single field by type
│       ├── fields/
│       │   ├── TextField.js
│       │   ├── NumberField.js
│       │   ├── DropdownField.js
│       │   ├── RadioField.js
│       │   ├── CheckboxField.js
│       │   ├── ArrayField.js            ← Dynamic add/remove list items
│       │   ├── ObjectField.js           ← Nested key-value fields
│       │   ├── ButtonField.js
│       │   ├── ToasterField.js          ← Triggers toast notification
│       │   └── PopupField.js            ← Opens a modal/popup
│       │
│       └── admin/
│           ├── PageSchemaBuilder.js     ← Main admin builder UI
│           ├── FieldConfigCard.js       ← Config panel per field
│           └── FieldTypePicker.js       ← Dropdown to choose field type
```

---

## 🗃️ The Schema JSON Format (The Brain of the System)

Every page/event in the database has a `schema` JSON field that looks like this:

```json
{
  "page_title": "Eid Milad Program Registration",
  "page_slug": "eid-milad-2026",
  "description": "Register for the Eid Milad celebration event.",
  "submit_label": "Register Now",
  "fields": [
    {
      "id": "f1",
      "key": "full_name",
      "label": "Full Name",
      "type": "text",
      "placeholder": "Enter your full name",
      "required": true,
      "helperText": "As per your CNIC"
    },
    {
      "id": "f2",
      "key": "age",
      "label": "Age",
      "type": "number",
      "min": 5,
      "max": 120,
      "required": true
    },
    {
      "id": "f3",
      "key": "gender",
      "label": "Gender",
      "type": "radio",
      "options": ["Male", "Female", "Other"],
      "required": true
    },
    {
      "id": "f4",
      "key": "city",
      "label": "City",
      "type": "dropdown",
      "options": ["Karachi", "Lahore", "Islamabad", "Other"],
      "required": false
    },
    {
      "id": "f5",
      "key": "languages",
      "label": "Languages Known",
      "type": "array",
      "itemType": "text",
      "placeholder": "Add a language"
    },
    {
      "id": "f6",
      "key": "emergency_contact",
      "label": "Emergency Contact",
      "type": "object",
      "fields": [
        { "key": "name", "label": "Name", "type": "text" },
        { "key": "phone", "label": "Phone", "type": "text" }
      ]
    },
    {
      "id": "f7",
      "key": "confirm_info",
      "label": "I confirm my information is correct",
      "type": "checkbox",
      "required": true
    },
    {
      "id": "f8",
      "key": "show_rules_popup",
      "label": "View Event Rules",
      "type": "button",
      "action": "popup",
      "popupContent": "1. Be on time.\n2. Dress appropriately.\n3. Follow staff instructions."
    },
    {
      "id": "f9",
      "key": "reminder_toast",
      "label": "Remind Me",
      "type": "button",
      "action": "toast",
      "toastMessage": "Reminder set! Event is on Friday at 8 PM.",
      "toastType": "success"
    }
  ]
}
```

---

## 🎛️ Supported Field Types

| Type | Description | Config Options |
|------|-------------|----------------|
| `text` | Single-line text input | `placeholder`, `required`, `helperText`, `minLength`, `maxLength` |
| `textarea` | Multi-line text area | `placeholder`, `rows`, `required` |
| `number` | Numeric input | `min`, `max`, `step`, `required` |
| `email` | Email input with validation | `placeholder`, `required` |
| `phone` | Phone number input | `placeholder`, `required` |
| `dropdown` | Select input | `options[]`, `required`, `placeholder` |
| `radio` | Radio button group | `options[]`, `required` |
| `checkbox` | Single checkbox | `required`, `label` |
| `checkboxGroup` | Multiple checkboxes | `options[]`, `required` |
| `date` | Date picker | `minDate`, `maxDate`, `required` |
| `time` | Time picker | `required` |
| `array` | Dynamic list (add/remove items) | `itemType`, `placeholder`, `minItems`, `maxItems` |
| `object` | Nested sub-form | `fields[]` (recursive schema) |
| `button` | Action button | `action`: `popup` or `toast` |
| `popup` | Opens a modal with content | `popupTitle`, `popupContent` |
| `toast` | Fires a toaster notification | `toastMessage`, `toastType` |
| `divider` | Visual section separator | `label` (optional) |
| `heading` | Display-only heading/text | `text`, `size` (h2, h3, p) |
| `image` | Image upload | `maxSizeMB`, `accept` |

---

## 🖥️ Admin Panel — Events Section UI Plan

### Page: `/admin/events`
- List of all created event/program pages
- Each row shows: **Page Title**, **Slug**, **Status** (Active/Draft), **# Fields**, **Last Updated**
- Buttons: `+ Create New Page`, `Edit`, `Delete`, `Preview`

### Page: `/admin/events/[slug]` (Page Builder)

#### Left Panel — Field List
- Drag-and-drop reorder of fields
- Each field shows: **Icon by type**, **Label**, **Key**, **Type**
- `+ Add Field` button opens a type picker

#### Right Panel — Field Configuration
When a field is selected:
- **Label** input (editable — what user sees)
- **Field Key** input (slug, used for data storage)
- **Type selector** (dropdown of all supported types)
- **Required toggle**
- **Placeholder** text
- **Helper text**
- **Type-specific options** (e.g., options list for dropdown/radio)
- **Validation rules** (min, max, pattern)
- **Conditional visibility** (show if `field_key` equals `value`)

#### Top Bar
- Page Title (editable)
- Page Slug (editable, auto-generates from title)
- Status toggle: **Draft** / **Active**
- `Save` button — writes JSON to Supabase
- `Preview` button — opens `/events/[slug]` in a new tab

---

## 🌐 Frontend — Dynamic Page: `/events/[slug]`

### How It Works (No Rebuild Needed)
1. Page uses **Next.js dynamic route** `[slug]`
2. On load, it calls an API route to fetch the schema for that slug
3. The schema is **never cached statically** — always fetched fresh from server
4. The `DynamicFormRenderer` component reads the schema and renders fields
5. On submit, the form data is sent to the API as a dynamic JSON object

### Key Behaviors
- If a field is removed in admin → it disappears from the page instantly
- If a label is changed in admin → it updates on the page on next load
- If a new field is added → it appears with no code change
- Works for any event, any structure

---

## 🔄 Data Flow (Runtime — No Rebuild)

```
User visits /events/eid-milad-2026
        │
        ▼
Next.js fetches schema from /api/events/schema?slug=eid-milad-2026
        │
        ▼
API reads from Supabase: SELECT schema FROM page_schemas WHERE slug = 'eid-milad-2026'
        │
        ▼
Schema JSON returned to frontend
        │
        ▼
DynamicFormRenderer builds the UI from schema
        │
        ▼
User fills form → clicks Submit
        │
        ▼
POST /api/events/submit with { slug, formData: { full_name: '...', age: 25, ... } }
        │
        ▼
Data stored in Supabase: event_submissions table
```

---

## 🗄️ Supabase Tables (Concept — No Prisma)

### `page_schemas`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `page_title` | text | Human-readable title |
| `page_slug` | text | URL slug (unique) |
| `schema` | jsonb | The full field schema JSON |
| `is_active` | boolean | Draft or live |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Tracks last edit |

### `event_submissions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `page_slug` | text | Which event this belongs to |
| `form_data` | jsonb | Dynamic submitted data |
| `submitted_by` | uuid | FK to user (optional) |
| `submitted_at` | timestamp | Auto |

---

## 🧩 Admin Panel Integration Points

The new Events section will integrate into the existing `/admin` layout just like current sections:
- `all-masjids`, `notice`, `jamat`, etc. follow the same pattern
- `/admin/events` will appear in the admin sidebar navigation
- The admin layout guard already protects all routes under `/admin`

---

## 🚦 Implementation Phases

### Phase 1 — Foundation (Current Plan)
- [ ] Create `page_schemas` table concept (Supabase SQL, no Prisma)
- [ ] Build admin `/admin/events` list page (UI only, static mock data)
- [ ] Build admin `/admin/events/[slug]` page builder UI

### Phase 2 — Dynamic Field Builder
- [ ] Implement `FieldTypePicker` and `FieldConfigCard` components
- [ ] Implement drag-and-drop field reordering
- [ ] Save schema to Supabase via existing API pattern

### Phase 3 — Frontend Renderer
- [ ] Build `DynamicFormRenderer` component
- [ ] Build all `Field*` components (TextField, DropdownField, etc.)
- [ ] Build `/events/[slug]` public page

### Phase 4 — Submissions & Polish
- [ ] Handle form submission → Supabase `event_submissions`
- [ ] Admin view for submission data
- [ ] Preview mode in admin

---

## ✅ Key Design Principles

1. **Zero Rebuild** — Schema lives in the database. The frontend always reads fresh.
2. **Supabase-First** — All schema and submission data goes to Supabase (aligns with existing stack).
3. **Composable Fields** — Every field type is its own React component, making it easy to add new types.
4. **Recursive Schema** — `object` and `array` types support nested schemas for complex data.
5. **Admin Owns Everything** — Field labels, types, order, visibility, validation — all from admin UI.
6. **Consistent with Existing Admin** — New section follows the same pattern as `notice`, `jamat`, etc.

---

*Plan authored: March 2026 — Pending user approval before implementation begins.*
