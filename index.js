function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            if (key === "style") {
                element.style.cssText = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
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

    update() {
        if (this._domNode) {
            const newNode = this.render();
            this._domNode.replaceWith(newNode);
            this._domNode = newNode;
        }
    }
}

class Task extends Component {
    constructor(task, onToggle, onDelete) {
        super();
        this.task = task;
        this.onToggle = onToggle;
        this.onDelete = onDelete;
    }

    render() {
        const labelStyle = this.task.completed
            ? "color: grey;"
            : "color: black;";

        return createElement("li", { style: "list-style: none; margin-bottom: 5px;" }, [
            createElement("input",
                { type: "checkbox", ...(this.task.completed ? { checked: "" } : {}) },
                null,
                { change: this.onToggle }
            ),
            createElement("label", { style: labelStyle }, this.task.text),
            createElement("button", { style: "margin-left: 10px; cursor: pointer;" }, "🗑️", { click: this.onDelete })
        ]);
    }
}

class AddTask extends Component {
    constructor(onAdd) {
        super();
        this.onAdd = onAdd;
        this.inputValue = "";
    }

    onInputChange = (event) => {
        this.inputValue = event.target.value;
    };

    onSubmit = () => {
        if (this.inputValue.trim()) {
            this.onAdd(this.inputValue);
            this.inputValue = "";
            this.update();
        }
    };

    render() {
        return createElement("div", { class: "add-todo", style: "margin-bottom: 20px;" }, [
            createElement("input", {
                type: "text",
                placeholder: "Задание",
                value: this.inputValue,
            }, null, { input: this.onInputChange }),
            createElement("button", { style: "margin-left: 5px;" }, "+", { click: this.onSubmit }),
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            tasks: [
                { text: "Сделать домашку", completed: false },
                { text: "Сделать практику", completed: true },
                { text: "Пойти домой", completed: false }
            ]
        };
    }

    onAddTask = (text) => {
        this.state.tasks.push({ text, completed: false });
        this.update();
    };

    onDeleteTask = (index) => {
        this.state.tasks.splice(index, 1);
        this.update();
    };

    onToggleTask = (index) => {
        this.state.tasks[index].completed = !this.state.tasks[index].completed;
        this.update();
    };

    render() {
        const addTaskNode = new AddTask(this.onAddTask).getDomNode();

        const taskNodes = this.state.tasks.map((task, index) => {
            return new Task(
                task,
                () => this.onToggleTask(index),
                () => this.onDeleteTask(index)
            ).getDomNode();
        });

        return createElement("div", {
            class: "todo-list",
            style: "font-family: sans-serif; max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;"
        }, [
            createElement("h1", { style: "text-align: center;" }, "TODO List"),
            addTaskNode,
            createElement("ul", { id: "todos", style: "padding: 0;" }, taskNodes),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});