export interface GuideEntry {
  id: string;
  title: string;
  whatItIs: string;
  whenToUse?: string;
  whatHappens?: string;
  important?: string;
  bulletPoints?: string[];
}

export interface GuideCategory {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  entries: GuideEntry[];
}

export const guideCategories: GuideCategory[] = [
  {
    id: 'getting-started',
    title: 'How Lumina Works',
    shortTitle: 'Getting Started',
    description:
      'Core mental model and personal operating system architecture for creative solo operators.',
    iconName: 'Compass',
    entries: [
      {
        id: 'mental-model',
        title: 'The Lumina Operating Flow',
        whatItIs:
          'Lumina is an operating system for independent photographers and videographers. It organizes client business from down payment through final settlement and archive.',
        whenToUse:
          'Use Lumina as your daily studio command center to track projects, production schedules, client questionnaires, deliverables, revision cycles, and cash flow.',
        whatHappens:
          'A typical project moves through: Client & Project Setup -> Workflow & Production Sessions -> Deliverables & Revision Loops -> Payment Milestones -> Project Closure.',
        important:
          'Lumina is not a photo/video editing tool or media DAM. RAW and master media remain in external storage (such as Google Drive). Lumina tracks commitments, dates, and financial truth.',
      },
      {
        id: 'snapshot-architecture',
        title: 'Project Data Snapshots',
        whatItIs:
          'When you create a project or apply a catalog package or workflow template, Lumina creates an independent snapshot of that data inside the project.',
        whatHappens:
          'Subsequent edits to catalog services, package prices, or workflow template blueprints will never silently mutate or rewrite historical project records.',
        important:
          'Historical project pricing, agreed services, and custom stages are permanently decoupled from catalog changes.',
      },
    ],
  },
  {
    id: 'clients-contacts',
    title: 'Clients & Contacts',
    shortTitle: 'Clients',
    description:
      'Manage individual clients, couples, corporate organizations, and multiple contacts/PICs.',
    iconName: 'UserCheck',
    entries: [
      {
        id: 'client-types',
        title: 'Client Identity Types',
        whatItIs:
          'Lumina supports four distinct client types: Individual, Couple, Organization, and Custom.',
        whenToUse:
          'Select Couple for weddings and engagements, Organization for commercial and agency accounts, or Individual for portraits and private sessions.',
        whatHappens:
          'The client record establishes billing ownership and organizes all linked past and active projects under one profile.',
      },
      {
        id: 'multiple-contacts',
        title: 'Multiple Contacts & PICs',
        whatItIs:
          'Each client profile can hold multiple specific persons in contact (PICs) with individual names, emails, phone numbers, and operational role labels.',
        whenToUse:
          'Use multiple contacts when an organization has a primary producer, a finance PIC, and an on-site event coordinator.',
        whatHappens:
          'When creating or editing a project, you can designate one contact as the project Primary Contact for direct communications.',
      },
      {
        id: 'client-archiving',
        title: 'Archiving Clients',
        whatItIs:
          'Archiving a client removes them from active dropdowns while preserving full historical links to existing projects, payments, and deliverables.',
        important: 'Archiving never deletes linked historical project data.',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects & Engagements',
    shortTitle: 'Projects',
    description:
      'Central project foundation, lifecycle statuses, and multi-service commercial scope.',
    iconName: 'Briefcase',
    entries: [
      {
        id: 'project-creation',
        title: 'Project Creation & Reference Numbers',
        whatItIs:
          'A project represents an agreed commercial engagement for a client. Each project holds its own title, optional project reference code (e.g. PRJ-2026-001), and financial ledger.',
        whenToUse:
          'Create a project when an inquiry converts and an initial booking or down payment agreement is reached.',
      },
      {
        id: 'project-statuses',
        title: 'Project Lifecycle Statuses',
        whatItIs:
          'Projects move through defined lifecycle states: Active, Draft, Archived, Closed, and Force Closed.',
        whatHappens:
          'Active projects appear in daily dashboard agenda, calendar filters, and active revenue calculations. Closed and Force Closed projects are preserved in read-only audit status unless explicitly reopened.',
      },
      {
        id: 'multi-service-scope',
        title: 'Multi-Service Commercial Scope',
        whatItIs:
          'A single project can contain multiple service lines (for example, combining photography coverage, drone videography, and rush delivery).',
        whatHappens:
          'The sum of all net project service line totals establishes the canonical Project Value.',
      },
    ],
  },
  {
    id: 'services-packages',
    title: 'Services & Packages Catalog',
    shortTitle: 'Catalog',
    description:
      'Reusable service catalog, bundled package presets, and independent project pricing snapshots.',
    iconName: 'Package',
    entries: [
      {
        id: 'service-catalog',
        title: 'Service Catalog',
        whatItIs:
          'A reusable list of standard services offered by your studio, categorized by service type with default unit prices.',
        whenToUse:
          'Define services in Settings to quickly add consistent line items to new project quotes.',
      },
      {
        id: 'package-catalog',
        title: 'Package Presets & Bundles',
        whatItIs:
          'Packages bundle multiple catalog services into a single commercial offering (such as a Full Wedding Package with 8hr photo, highlight reel, and album).',
        whatHappens:
          'Packages automatically calculate the sum of included service items and allow setting custom bundled rates.',
      },
      {
        id: 'package-snapshots',
        title: 'Package Application Snapshot',
        whatItIs:
          'Applying a package to a project clones its line items directly into that project as independent Project Services.',
        whenToUse:
          'Use the Apply Package shortcut when setting up a project quote from a standard offering.',
        whatHappens:
          'The items become project-owned. You can customize quantities, unit prices, or discounts for that specific client without altering the global catalog template.',
        important:
          'Modifying or deleting a package in Settings later will never change past or existing projects where the package was applied.',
      },
    ],
  },
  {
    id: 'workflow-tasks',
    title: 'Workflow & Tasks',
    shortTitle: 'Workflow',
    description:
      'Customizable stage blueprints, non-linear pipelines, and stage-scoped task checklists.',
    iconName: 'GitBranch',
    entries: [
      {
        id: 'workflow-templates',
        title: 'Workflow Templates',
        whatItIs:
          'Reusable stage blueprints (e.g. Pre-Production, Main Shoot, Rough Cut, Color & Master, Delivery) created in Settings.',
        whenToUse:
          'Use workflow templates to quickly seed a standard stage pipeline when starting a new project.',
      },
      {
        id: 'template-snapshot',
        title: 'Workflow Template Snapshot',
        whatItIs:
          'Applying a workflow template copies its stages into the project as project-specific workflow stages.',
        whatHappens:
          'The project receives its own stage records. You can add, reorder, rename, or delete stages for that project without modifying the global template.',
      },
      {
        id: 'non-linear-stages',
        title: 'Non-Linear Multiple Active Stages',
        whatItIs:
          'Lumina allows multiple stages to be in progress simultaneously. Stages are not locked into a rigid waterfall.',
        whatHappens:
          'You can set stages to Pending, In Progress, Completed, or Skipped in any order that fits production reality.',
        important:
          'Lumina does not enforce an artificial completion percentage. Operational progress is driven by concrete stage status and task completion.',
      },
      {
        id: 'stage-tasks',
        title: 'Stage-Scoped & Project Tasks',
        whatItIs:
          'Tasks can be scoped to a specific workflow stage or assigned directly to the project as general checklist items.',
        whatHappens:
          'Tasks carry due dates. Overdue tasks are automatically elevated into the Needs Attention card on your daily Dashboard.',
      },
    ],
  },
  {
    id: 'sessions-schedule',
    title: 'Sessions & Production Schedule',
    shortTitle: 'Sessions',
    description:
      'Track shoots, client meetings, technical reviews, and production calendar deadlines.',
    iconName: 'Calendar',
    entries: [
      {
        id: 'production-sessions',
        title: 'Production Sessions',
        whatItIs:
          'A session represents a scheduled physical or virtual production event (Shoot, Client Meeting, Review, Fitting, or Custom).',
        whenToUse:
          'Log sessions with specific calendar dates, start/end times, and physical location addresses.',
        whatHappens:
          'Sessions appear in the project session list, on your master production calendar, and in the client-facing public status portal.',
      },
      {
        id: 'production-calendar',
        title: 'Production Calendar & Filtering',
        whatItIs:
          'The Calendar module aggregates all scheduled production sessions, deliverable deadlines, and payment due dates across active projects in your workspace.',
        whatHappens:
          'You can toggle between Month View and Agenda View, and filter events by category (Shoots, Deliverables, Payments).',
        important:
          'The production calendar reflects studio operational milestones. It does not synchronize automatically with external personal calendars.',
      },
    ],
  },
  {
    id: 'deliverables-revisions',
    title: 'Deliverables & Revision Cycles',
    shortTitle: 'Deliverables',
    description:
      'Track promised creative assets, client feedback loops, and immutable revision history.',
    iconName: 'FileBox',
    entries: [
      {
        id: 'deliverables-required',
        title: 'Deliverables & Required Closure Gate',
        whatItIs:
          'A deliverable is a promised creative output (e.g. 50 Retouched Photos, 4K Master Video, Highlight Teaser).',
        whatHappens:
          'Deliverables move through: Draft -> In Progress -> Delivered -> Revision Requested -> Approved.',
        important:
          'Deliverables marked as Required must reach Approved status before a project is eligible for Normal Close.',
      },
      {
        id: 'revision-cycles',
        title: 'Revision Cycles & Feedback History',
        whatItIs:
          'When a client requests adjustments on a delivered asset, you log a numbered revision cycle with written feedback notes and a target turnaround deadline.',
        whatHappens:
          'The deliverable status updates to Revision Requested. Previous revision notes and feedback history are preserved in an immutable log.',
        important:
          'Revision cycles do not overwrite earlier feedback. You can always review past feedback rounds to verify scope boundaries.',
      },
    ],
  },
  {
    id: 'project-brief',
    title: 'Project Brief & Client Intake',
    shortTitle: 'Project Brief',
    description:
      '1:1 canonical brief builder, field visibility rules, intake links, and submission diff review.',
    iconName: 'ClipboardList',
    entries: [
      {
        id: 'canonical-brief',
        title: 'The Canonical Project Brief',
        whatItIs:
          'Each project contains exactly one canonical Project Brief, structured into customizable sections and specific question fields (Text, Textarea, Select, Multi-select, Date, Number, Boolean).',
        whenToUse:
          'Use the brief builder to capture creative vision, shot lists, aesthetic moodboards, wardrobe guidelines, and client constraints.',
      },
      {
        id: 'field-visibilities',
        title: 'Field Visibility Rules',
        whatItIs:
          'Every brief field has an explicit visibility setting: Internal (owner only), View Only (client can view on status portal), or Fillable (client can fill out via intake link).',
        important:
          'Internal fields (such as private notes, technical gear lists, or budget estimates) are never exposed to clients.',
      },
      {
        id: 'brief-templates',
        title: 'Brief Templates',
        whatItIs:
          'Save an established brief structure as a reusable template in Settings, or apply an existing template to quickly set up a new project questionnaire.',
      },
      {
        id: 'submission-review',
        title: 'Client Intake & Submission Review',
        whatItIs:
          'Generate a tokenized Public Brief Intake Link for the client to answer fillable questions online.',
        whatHappens:
          'When the client submits their responses, Lumina generates a pending submission. The owner reviews submitted answers side-by-side against canonical fields.',
        important:
          'Client submissions never silently overwrite canonical brief data. The owner explicitly accepts or rejects each submitted answer. Accepted answers update the canonical brief, while the raw submission record is permanently preserved for audit.',
      },
    ],
  },
  {
    id: 'files-sharing',
    title: 'Files & Client Sharing',
    shortTitle: 'Files & Sharing',
    description:
      'External media reference links, public status portal, privacy boundaries, and token revocation.',
    iconName: 'Share2',
    entries: [
      {
        id: 'external-links',
        title: 'External File References',
        whatItIs:
          'Attach external links (Google Drive folders, Dropbox shares, Frame.io review links, web URLs) directly to the project or associate them with individual deliverables.',
        whatHappens:
          'Provides one-click access to master media folders without uploading heavy RAW files or video masters directly into Lumina storage.',
      },
      {
        id: 'status-portal',
        title: 'Public Project Status Portal',
        whatItIs:
          'A secure, tokenized public link (/share/:token) that lets clients view live project timeline progress, scheduled sessions, approved deliverables, and shared file links.',
        whenToUse:
          'Share this link with your client to keep them informed on production progress without exchanging repetitive status emails.',
      },
      {
        id: 'privacy-boundary',
        title: 'Strict Privacy & Security Boundary',
        whatItIs:
          'The public status portal is an isolated read projection. It strictly excludes all internal project data.',
        whatHappens:
          'Financial numbers, payment schedules, received amounts, profit metrics, generic expenses, collaborator fees, and internal notes are never exposed via the public link.',
        important: 'Client-facing surfaces are completely isolated from internal financial data.',
      },
      {
        id: 'token-revocation',
        title: 'Link Revocation',
        whatItIs: 'The owner can revoke a public share link at any time from the share modal.',
        whatHappens:
          'The link token is immediately invalidated. Anyone visiting the old URL sees an expired/revoked link notice.',
      },
    ],
  },
  {
    id: 'payments-finance',
    title: 'Payments & Project Finance',
    shortTitle: 'Finance',
    description:
      'Canonical financial terminology, exact calculation formulas, milestone tracking, and expenses.',
    iconName: 'Coins',
    entries: [
      {
        id: 'finance-terms',
        title: 'Canonical Financial Terms',
        whatItIs: 'Lumina uses specific, unambiguous terminology for project financial health.',
        bulletPoints: [
          'Project Value: Total agreed commercial value, calculated as the sum of all project service net line totals.',
          'Paid Amount: Total funds received from the client across paid payment milestones.',
          'Receivable: Project Value minus Paid Amount. Represents outstanding client balance.',
          'Generic Expenses: Sum of direct production costs (rentals, permits, transport, catering).',
          'Committed Collaborator Cost: Sum of agreed fees for external crew and editors.',
          'Total Project Cost: Generic Expenses plus Committed Collaborator Cost.',
          'Projected Profit: Project Value minus Total Project Cost.',
          'Margin: (Projected Profit / Project Value) * 100.',
        ],
      },
      {
        id: 'receivable-calculation',
        title: 'Receivable & Overpayment Handling',
        whatItIs:
          'Receivable represents remaining client balance: Receivable = Project Value - Paid Amount.',
        whatHappens:
          'If a client pays more than the quoted project value (such as an extra tip or overpayment), Receivable becomes negative.',
        important:
          'Receivable is never artificially clamped at zero. A negative balance truthfully reflects overpayment or client credit.',
      },
      {
        id: 'projected-profit',
        title: 'Projected Profit vs Accounting Profit',
        whatItIs:
          'Projected Profit reflects project-level economics: Projected Profit = Project Value - Total Project Cost.',
        important:
          'This is an operational projection for the specific project, not a retroactive tax or corporate bookkeeping metric.',
      },
      {
        id: 'payment-milestones',
        title: 'Payment Milestones & Timing States',
        whatItIs:
          'Schedule client payments as milestone records (Down Payment, Installment, Final Settlement) with specific due dates and amounts.',
        whatHappens:
          'Milestones display real-time timing indicators: Paid, Upcoming (due in future), Due Today, or Overdue (pending past due date).',
      },
      {
        id: 'generic-expenses',
        title: 'Generic Production Expenses',
        whatItIs:
          'Log production costs with dates, categories (Transport, Equipment Rental, Location Permit, Studio, Catering), amounts, and receipts.',
        whatHappens:
          'Expenses automatically update Total Project Cost and reduce Projected Profit.',
      },
    ],
  },
  {
    id: 'collaborators-costs',
    title: 'Collaborators & Project Costs',
    shortTitle: 'Collaborators',
    description:
      'Workspace crew rolodex, project-specific engagements, agreed fees, and cost commitments.',
    iconName: 'Users',
    entries: [
      {
        id: 'collaborator-rolodex',
        title: 'Collaborator Rolodex vs Project Engagement',
        whatItIs:
          'A Collaborator is a reusable contact in your studio rolodex (second shooter, assistant, colorist, editor). A Collaborator Engagement is a project-specific assignment.',
        whenToUse:
          'Add crew members to your workspace directory in Settings, then engage them on individual projects with designated roles and agreed fees.',
      },
      {
        id: 'agreed-fees',
        title: 'Committed Collaborator Costs',
        whatItIs:
          'When you engage a collaborator on a project with an agreed fee, that fee is immediately committed to Total Project Cost.',
        whatHappens:
          'The fee accurately reflects your cost commitment even before the payout is marked as sent.',
      },
      {
        id: 'collaborator-payouts',
        title: 'Collaborator Payout Progress',
        whatItIs:
          'Track payout status per engagement: Unpaid, Partial, or Paid, with running totals of fees paid.',
      },
    ],
  },
  {
    id: 'project-closure',
    title: 'Project Completion & Closure',
    shortTitle: 'Closure',
    description:
      'Normal Close eligibility gates, Force Close override with audit reasons, and reopening.',
    iconName: 'CheckCircle2',
    entries: [
      {
        id: 'normal-close',
        title: 'Normal Close Requirements',
        whatItIs:
          'Normal Close is the standard procedure to conclude a successfully completed project.',
        whatHappens:
          'A project is eligible for Normal Close only when: 1. All required deliverables have status Approved, AND 2. Receivable is zero (all client payments are collected in full).',
        important:
          'Lumina never automatically closes a project. Closure is an explicit, deliberate operator action.',
      },
      {
        id: 'force-close',
        title: 'Force Close Override & Operational Freeze',
        whatItIs:
          'Force Close stops operational work on a project when normal closure conditions cannot be met (such as a client cancellation, dispute, or default).',
        whatHappens:
          'Force Close requires an explicit written audit reason. When force-closed: 1. The project status transitions to Force Closed with recorded timestamp and reason. 2. Operational editing (creating stages, tasks, deliverables, sessions, expenses, or collaborator assignments) is frozen. 3. Recording incoming payments on remaining receivables is still permitted. 4. Existing project history is permanently preserved.',
        important:
          'Force Close does not mark unfinished deliverables as approved, and it never silently erases unpaid balances or debt.',
      },
      {
        id: 'reopening',
        title: 'Reopening Closed Projects',
        whatItIs:
          'The owner can explicitly reopen any Closed or Force Closed project back to Active.',
        whatHappens:
          'Restores operational editing permissions and returns the project to active tracking without rewriting previous audit logs.',
      },
    ],
  },
  {
    id: 'dashboard-overview',
    title: 'Daily Operational Dashboard',
    shortTitle: 'Dashboard',
    description:
      'Today agenda, urgent attention items, active project cards, and workspace horizon metrics.',
    iconName: 'LayoutDashboard',
    entries: [
      {
        id: 'today-agenda',
        title: 'Today Agenda & Immediate Focus',
        whatItIs:
          'The Today section highlights production sessions, deliverable milestones, and payment dates scheduled specifically for the current day.',
      },
      {
        id: 'needs-attention',
        title: 'Needs Attention Card',
        whatItIs:
          'Surfaces urgent operational blockers across your workspace: overdue client payments, deliverable revision deadlines, and overdue tasks.',
      },
      {
        id: 'horizon-metrics',
        title: 'Operational Horizon Metrics',
        whatItIs:
          'Compact top-level metrics reflecting current business state: Active Projects count, Outstanding Receivables, Collected Revenue, and Shoots Scheduled this month.',
      },
    ],
  },
];
