import { MODULE_ID } from '../constants.mjs';

export function getFlag(doc, key) {
  return doc.getFlag(MODULE_ID, key);
}

export function setFlag(doc, key, value) {
  return doc.setFlag(MODULE_ID, key, value);
}

export function unsetFlag(doc, key) {
  return doc.unsetFlag(MODULE_ID, key);
}