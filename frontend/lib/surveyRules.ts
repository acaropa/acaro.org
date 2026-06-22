export type SingleChoiceAnswer = {
  type: 'single_choice'
  optionId: number
  value: string
  textFree?: string
}

export type MultipleChoiceAnswer = {
  type: 'multiple_choice'
  selections: Array<{
    optionId: number
    value: string
    textFree?: string
  }>
}

export type AnswerValue = string | number | boolean | SingleChoiceAnswer | MultipleChoiceAnswer

type RuleCondition = {
  codigo_pregunta: string
  operador?: '=' | '!=' | 'in' | 'contains'
  valor: unknown
}

export type ValidationRules = {
  visible_si?: RuleCondition
  visible_si_cualquiera?: RuleCondition[]
  visible_si_todas?: RuleCondition[]
  obligatoria_si?: RuleCondition
  obligatoria_si_cualquiera?: RuleCondition[]
  obligatoria_si_todas?: RuleCondition[]
  patron?: string
  mensaje?: string
  min?: number
  max?: number
}

function getComparableValue(answer: AnswerValue | undefined): unknown {
  if (typeof answer === 'string' || typeof answer === 'number' || typeof answer === 'boolean') {
    return answer
  }
  if (answer && typeof answer === 'object' && 'type' in answer) {
    if (answer.type === 'single_choice') return answer.value
    if (answer.type === 'multiple_choice') return answer.selections.map(s => s.value)
  }
  return undefined
}

function evaluateCondition(
  condition: RuleCondition,
  answersByCode: Record<string, AnswerValue | undefined>
): boolean {
  const actual = getComparableValue(answersByCode[condition.codigo_pregunta])
  const op = condition.operador ?? '='

  switch (op) {
    case '=': return actual === condition.valor
    case '!=': return actual !== condition.valor
    case 'in': return Array.isArray(condition.valor) && (condition.valor as unknown[]).includes(actual)
    case 'contains': return Array.isArray(actual) && (actual as unknown[]).includes(condition.valor)
    default: return false
  }
}

export function isQuestionVisible(
  question: { reglas_validacion?: ValidationRules | null },
  answersByCode: Record<string, AnswerValue | undefined>
): boolean {
  const rules = question.reglas_validacion
  if (!rules) return true
  if (rules.visible_si && !evaluateCondition(rules.visible_si, answersByCode)) return false
  if (rules.visible_si_todas && !rules.visible_si_todas.every(r => evaluateCondition(r, answersByCode))) return false
  if (rules.visible_si_cualquiera && !rules.visible_si_cualquiera.some(r => evaluateCondition(r, answersByCode))) return false
  return true
}

export function isQuestionRequired(
  question: { es_obligatoria?: boolean; reglas_validacion?: ValidationRules | null },
  answersByCode: Record<string, AnswerValue | undefined>
): boolean {
  const rules = question.reglas_validacion
  if (!rules) return !!question.es_obligatoria
  if (rules.obligatoria_si && evaluateCondition(rules.obligatoria_si, answersByCode)) return true
  if (rules.obligatoria_si_todas && rules.obligatoria_si_todas.every(r => evaluateCondition(r, answersByCode))) return true
  if (rules.obligatoria_si_cualquiera && rules.obligatoria_si_cualquiera.some(r => evaluateCondition(r, answersByCode))) return true
  return !!question.es_obligatoria
}
