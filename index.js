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

    update() {
        if (this._domNode) {
            const newNode = this.render();
            this._domNode.replaceWith(newNode);
            this._domNode = newNode;
        }
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            inputValue: "",
            tasks: [
                {text: "Сделать домашку", completed: false},
                {text: "Сделать практику", completed: false},
                {text: "Пойти домой", completed: false}
            ]
        };
    }

    onAddInputChange = (event) => {
        this.state.inputValue = event.target.value;
    };

    onAddTask = () => {
        if (this.state.inputValue.trim() !== "") {
            this.state.tasks.push({text: this.state.inputValue, completed: false});
            this.state.inputValue = "";
            console.log("Новый стейт:", this.state.tasks);
            this.update();
        }
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
        const taskElements = this.state.tasks.map((task, index) => {
            const labelStyle = task.completed ? "color: grey;" : "";
            return createElement("li", {}, [
                createElement("input",
                    { type: "checkbox", ...(task.completed ? { checked: "" } : {}) },
                    null,
                    { change: () => this.onToggleTask(index) }
                ),
                createElement("label", { style: labelStyle }, task.text),
                createElement("button", {}, "🗑️", { click: () => this.onDeleteTask(index) })
            ]);
        });

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                    value: this.state.inputValue,
                }, null, {input: this.onAddInputChange}),

                createElement("button", {id: "add-btn"}, "+", {click: this.onAddTask}),
            ]),
            createElement("ul", {id: "todos"}, taskElements),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});