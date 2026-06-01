const SVG_TRUNCATE_LIMIT = 4096;

function appendProjectContext(text, body) {
  const { projectContextText, projectFiles } = body;
  if (projectContextText?.trim()) {
    text += `\n\nProject context:\n${projectContextText.trim()}`;
  }
  if (projectFiles?.length) {
    text += '\n\nProject files:';
    projectFiles.forEach((f) => {
      text += `\n\n### ${f.name}\n${f.content}`;
    });
  }
  return text;
}

export function buildIntakeText(body) {
  const { platform, userType, changeType, existing, change, assumptionNote } = body;
  let text = `Platform: ${platform}\nUser type: ${userType}\nChange type: ${changeType}\n\nWhat exists:\n${existing}\n\nWhat needs to change:\n${change}`;
  text = appendProjectContext(text, body);
  if (assumptionNote?.trim()) {
    text += `\n\nDesigner correction on assumptions:\n${assumptionNote}`;
  }
  return text;
}

export function formatResolvedAnswers(result, answers, answerOthers) {
  if (!answers || Object.keys(answers).length === 0) return '';
  const questions = result?.questions || [];
  const qMap = Object.fromEntries(questions.map((q) => [q.id, q.text]));

  const lines = Object.entries(answers).map(([id, val]) => {
    const answer = val === '__other__' ? (answerOthers?.[id] || '') : val;
    const question = qMap[id] || id;
    return `Q: ${question}\nA: ${answer}`;
  });
  return `\n\nQuestion answers:\n${lines.join('\n\n')}`;
}

function formatWireframeBrief(wb) {
  if (!wb) return '';
  const lines = [`Target screen: ${wb.targetScreen || 'Main screen'}`];
  if (wb.productTerms?.length) {
    lines.push(`Product terms: ${wb.productTerms.join(', ')}`);
  }
  if (wb.constraints?.length) {
    lines.push('Constraints:');
    wb.constraints.forEach((c) => lines.push(`- ${c}`));
  }
  if (wb.visualPatterns?.length) {
    lines.push('Visual patterns:');
    wb.visualPatterns.forEach((p) => lines.push(`- ${p}`));
  }
  return lines.join('\n');
}

function formatDirectionsDistillate(result) {
  if (!result?.directions?.length) return '';
  const lines = [`Category: ${result.categoryLabel || result.category || ''}`];
  result.directions.forEach((d) => {
    lines.push(`\nDirection ${d.id}: ${d.name}`);
    lines.push(`Rationale: ${d.rationale || ''}`);
    lines.push(`Layout: ${d.layout || ''}`);
  });
  if (result.assumptions?.length) {
    lines.push('\nAssumptions:');
    result.assumptions.forEach((a) => lines.push(`- ${a}`));
  }
  return lines.join('\n');
}

export function buildAnalyzeMessages(body) {
  const content = [];
  const screenshots = body.screenshots || [];
  screenshots.forEach((s) => {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: s.mediaType, data: s.base64 },
    });
  });
  let text = buildIntakeText(body);
  if (screenshots.length > 0) {
    text += `\n\n${screenshots.length} screenshot(s) attached — study them carefully.`;
  }
  content.push({ type: 'text', text });
  return [{ role: 'user', content }];
}

export function buildPlanContext(body) {
  const { platform, userType, changeType, existing, change, result, answers, answerOthers } = body;
  let text = `Platform: ${platform}\nUser type: ${userType}\nChange type: ${changeType}\n\nWhat exists:\n${existing}\n\nWhat needs to change:\n${change}`;

  if (result?.wireframeBrief) {
    text += `\n\nWireframe brief:\n${formatWireframeBrief(result.wireframeBrief)}`;
  }

  text += `\n\nDesign directions:\n${formatDirectionsDistillate(result)}`;
  text += formatResolvedAnswers(result, answers, answerOthers);

  return text;
}

export function buildScreenPrompt(spec, body) {
  const { platform, change } = body;
  const changeSummary = (change || '').slice(0, 200);
  return `Platform: ${platform}
Change summary: ${changeSummary}

Generate ONLY screen ${spec.id}: "${spec.title}"
Tag: ${spec.tag}
Subtitle: ${spec.sub}
Layout notes: ${spec.layoutNotes}

Return exactly one screen with id ${spec.id}, matching this metadata, plus the complete SVG.`;
}

export function truncateSvg(svg) {
  if (!svg || svg.length <= SVG_TRUNCATE_LIMIT) {
    return { svg, omitted: false };
  }
  return { svg: null, omitted: true };
}

export function buildIteratePrompt(screen, iterNote) {
  const { svg: refSvg, omitted } = truncateSvg(screen.svg);
  let text = `Screen ${screen.id}: "${screen.title}" (${screen.tag})
Subtitle: ${screen.sub}

Layout notes:
${screen.layoutNotes || 'No layout notes — infer from reference if provided.'}

MUST change (implement visibly in the new SVG):
${iterNote}`;

  if (refSvg) {
    text += `\n\nReference SVG (do not copy — produce a new SVG reflecting the feedback):\n${refSvg}`;
  } else if (omitted) {
    text += '\n\nReference SVG omitted for size — apply feedback to the layout notes above.';
  }

  text += `\n\nUpdate ONLY screen ${screen.id}. Return matching metadata plus the complete SVG.`;
  return text;
}

export function logContextSize(stage, text) {
  if (process.env.NODE_ENV === 'production') return;
  console.log(`[context] ${stage}: ${text.length} chars`);
}
