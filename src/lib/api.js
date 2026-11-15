async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 413) {
    throw new Error('Upload too large — use fewer or smaller files.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function analyze(payload) {
  return postJson('/api/analyze', payload);
}

export function generateWireframes(payload) {
  return postJson('/api/wireframes', payload);
}

export function iterateScreens(payload) {
  return postJson('/api/iterate', payload);
}

function baseFields(state) {
  const {
    platform,
    platformOther,
    userType,
    userTypeOther,
    changeType,
    changeTypeOther,
    existing,
    change,
    result,
    answers,
    answerOthers,
    assumptionNote,
  } = state;

  const getVal = (val, other) => (val === '__other__' ? other : val);

  return {
    platform: getVal(platform, platformOther),
    userType: getVal(userType, userTypeOther),
    changeType: getVal(changeType, changeTypeOther),
    existing,
    change,
    result,
    answers,
    answerOthers,
    assumptionNote,
  };
}

export function buildPayload(state, { profile = 'analyze' } = {}) {
  const base = baseFields(state);

  if (profile === 'analyze') {
    const { screenshots, projectContextText, projectFiles } = state;
    return {
      ...base,
      screenshots: (screenshots || []).map(({ base64, mediaType }) => ({ base64, mediaType })),
      projectContextText: projectContextText || '',
      projectFiles: (projectFiles || []).map(({ name, content }) => ({ name, content })),
    };
  }

  if (profile === 'wireframes') {
    return base;
  }

  if (profile === 'iterate') {
    const { screens, selected, iterNote } = state;
    return {
      ...base,
      screens,
      selectedIds: Array.from(selected || []),
      iterNote,
    };
  }

  return base;
}
