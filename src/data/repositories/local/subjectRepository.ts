import { SUBJECT_CATALOG } from '../../seed/subjects/index'
import type { Subject, SubjectDefinition } from '../../../types'
import type { SubjectRepository } from '../types'

export class LocalSubjectRepository implements SubjectRepository {
  getAllSubjects() {
    return SUBJECT_CATALOG
  }

  getSubject(id: Subject): SubjectDefinition | undefined {
    return SUBJECT_CATALOG.find((subject) => subject.id === id)
  }
}
