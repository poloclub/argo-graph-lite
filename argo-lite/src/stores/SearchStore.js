import { observable } from "mobx";

export default class SearchStore {
  @observable searchStr = "";
  @observable candidates = [];
  @observable numCandidates = 0;
  @observable panelOpen = false;
}
