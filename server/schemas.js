const directionItem = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    principle: { type: 'string' },
    rationale: { type: 'string' },
    layout: { type: 'string' },
    watchOut: { type: 'string' },
    quickWins: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'name', 'principle', 'rationale', 'layout', 'watchOut', 'quickWins'],
  additionalProperties: false,
};

export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    categoryLabel: { type: 'string' },
    categoryDescription: { type: 'string' },
    pushback: {
      type: 'object',
      properties: {
        needed: { type: 'boolean' },
        issue: { type: 'string' },
        recommendation: { type: 'string' },
      },
      required: ['needed', 'issue', 'recommendation'],
      additionalProperties: false,
    },
    assumptions: { type: 'array', items: { type: 'string' } },
    blocking: { type: 'array', items: { type: 'string' } },
    directions: { type: 'array', items: directionItem },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          opts: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'text', 'opts'],
        additionalProperties: false,
      },
    },
    wireframeBrief: {
      type: 'object',
      properties: {
        targetScreen: { type: 'string' },
        productTerms: { type: 'array', items: { type: 'string' } },
        constraints: { type: 'array', items: { type: 'string' } },
        visualPatterns: { type: 'array', items: { type: 'string' } },
      },
      required: ['targetScreen', 'productTerms', 'constraints', 'visualPatterns'],
      additionalProperties: false,
    },
  },
  required: [
    'category',
    'categoryLabel',
    'categoryDescription',
    'pushback',
    'assumptions',
    'blocking',
    'directions',
    'questions',
    'wireframeBrief',
  ],
  additionalProperties: false,
};

const screenMeta = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    sub: { type: 'string' },
    tag: { type: 'string' },
    tagColor: { type: 'string' },
  },
  required: ['id', 'title', 'sub', 'tag', 'tagColor'],
  additionalProperties: false,
};

export const WIREFRAME_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    screens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...screenMeta.properties,
          layoutNotes: { type: 'string' },
        },
        required: [...screenMeta.required, 'layoutNotes'],
        additionalProperties: false,
      },
    },
  },
  required: ['screens'],
  additionalProperties: false,
};

export const SINGLE_SCREEN_SCHEMA = {
  type: 'object',
  properties: {
    screens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...screenMeta.properties,
          svg: { type: 'string' },
        },
        required: [...screenMeta.required, 'svg'],
        additionalProperties: false,
      },
    },
  },
  required: ['screens'],
  additionalProperties: false,
};
