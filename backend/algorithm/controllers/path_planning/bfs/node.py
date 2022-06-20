class BFSNode:
    def __init__(self, state, parent = None):
        self.state = state
        self.parent = parent
        self.children = []


    def add_children(self, children):
        self.children.extend(children)
