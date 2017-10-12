export type NodeId = string;
export type PassageId = string;

export type StoryboardType = Story|StoryGraph|Node|Passage|Choice|Predicate|NodeBag

export interface Story {
  graph?: StoryGraph
  bag?: NodeBag

}

export interface StoryGraph {
  start?: NodeId;
  nodes: {[name: string]: Node}
}

export interface Node {
  nodeId: NodeId;
  passages?: Passage[];
  choices?: Choice[];
  track?: string;
  predicate?: Predicate;
  allowRepeats?: boolean;
}

export interface Passage {
  passageId: PassageId;
  type?: string;
  content?: string;
  predicate?: Predicate,
  set?: {[key: string]: string|any} // TODO: "any" is used for RNG.
}

export interface Choice {
  nodeId: NodeId;
  predicate?: Predicate;
}

export type Predicate = {[key: string]: Predicate|Predicate[]|string|number|boolean|any} // TODO: 'any' used for RNG
export type NodeBag = {[key: string]: Node}