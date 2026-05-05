function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (callbacks) {
    Object.keys(callbacks).forEach((eventName) => {
      element.addEventListener(eventName, callbacks[eventName]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      inputValue: "", 
      tasks: [
        { text: "Сделать домашку", completed: false },
        { text: "Сделать практику", completed: false },
        { text: "Пойти домой", completed: false }
      ]
    };
  }

  onAddInputChange = (event) => {
    this.state.inputValue = event.target.value;
  };

  onAddTask = () => {
    if (this.state.inputValue.trim() !== "") {
      this.state.tasks.push({ text: this.state.inputValue, completed: false });
      this.state.inputValue = "";

      console.log("Новый стейт:", this.state.tasks); 
    }
  };

  render() {
    const taskElements = this.state.tasks.map(task => {
      return createElement("li", {}, [
        createElement("input", { type: "checkbox" }),
        createElement("label", {}, task.text),
        createElement("button", {}, "🗑️")
      ]);
    });

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
        }, null, { input: this.onAddInputChange }), 

        createElement("button", { id: "add-btn" }, "+", { click: this.onAddTask }), 
      ]),
      createElement("ul", { id: "todos" }, taskElements),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});