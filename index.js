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
        this._childComponents = new Map();
    }

    getDomNode() {
        if (!this._domNode) {
            this._domNode = this.render();
        }
        return this._domNode;
    }

    update() {
        if (this._domNode) {
            const newNode = this.render();
            this._domNode.replaceWith(newNode);
            this._domNode = newNode;
        }
    }

    getChildComponent(key, ComponentClass, ...args) {
        if (!this._childComponents.has(key)) {
            this._childComponents.set(key, new ComponentClass(...args));
        } else {
            const component = this._childComponents.get(key);
            if (args.length > 0) {
                component.task = args[0];
            }
        }
        return this._childComponents.get(key);
    }
}

class Task extends Component {
    constructor(task, onToggle, onDelete) {
        super();
        this.task = task;
        this.onToggle = onToggle;
        this.onDelete = onDelete;
        this.state = {
            isDeleteWarning: false,
        };
    }

    onDeleteClick = () => {
        if (this.state.isDeleteWarning) {
            this.onDelete();
        } else {
            this.state.isDeleteWarning = true;
            this.update();
        }
    };

    render() {
        const labelStyle = this.task.completed
            ? "color: grey;"
            : "color: black;";

        const deleteButtonStyle = this.state.isDeleteWarning
            ? "margin-left: 10px; cursor: pointer; background-color: red;"
            : "margin-left: 10px; cursor: pointer;";

        return createElement("li", { style: "list-style: none; margin-bottom: 5px;" }, [
            createElement("input",
                { type: "checkbox", ...(this.task.completed ? { checked: "" } : {}) },
                null,
                { change: this.onToggle }
            ),
            createElement("label", { style: labelStyle }, this.task.text),
            createElement("button", { style: deleteButtonStyle }, "🗑️", { click: this.onDeleteClick })
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
        return createElement("div", {class: "add-todo", style: "margin-bottom: 20px;"}, [
            createElement("input", {
                type: "text",
                placeholder: "Задание",
                value: this.inputValue,
            }, null, {input: this.onInputChange}),
            createElement("button", {style: "margin-left: 5px;"}, "+", {click: this.onSubmit}),
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();
        const savedTasks = localStorage.getItem('todoTasks');
        this.state = {
            tasks: savedTasks ? JSON.parse(savedTasks) : [
                {text: "Сделать домашку", completed: false},
                {text: "Сделать практику", completed: true},
                {text: "Пойти домой", completed: false}
            ]
        };
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.state.tasks));
    }

    onAddTask = (text) => {
        this.state.tasks.push({text, completed: false});
        this.saveTasks();
        this.update();
    };

    onDeleteTask = (index) => {
        this.state.tasks.splice(index, 1);
        this.saveTasks();
        this.update();
    };

    onToggleTask = (index) => {
        this.state.tasks[index].completed = !this.state.tasks[index].completed;
        this.saveTasks();
        this.update();
    };

    render() {
        this._childComponents.clear();
        const addTaskNode = new AddTask(this.onAddTask).getDomNode();

        const taskNodes = this.state.tasks.map((task, index) => {
            const taskComponent = this.getChildComponent(`task-${index}`, Task, task,
                () => this.onToggleTask(index),
                () => this.onDeleteTask(index)
            );
            return taskComponent.getDomNode();
        });

        return createElement("div", {
            class: "todo-list",
            style: "font-family: sans-serif; max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;"
        }, [
            createElement("h1", {style: "text-align: center;"}, "TODO List"),
            addTaskNode,
            createElement("ul", {id: "todos", style: "padding: 0;"}, taskNodes),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});