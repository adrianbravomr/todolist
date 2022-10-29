import {app} from './app'

import {format,formatDistanceToNow} from "date-fns";

// Import our custom CSS
import '../styles/styles.css'
// Import our custom CSS
import '../styles/styles.scss'
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

export const dom = (() => {

    let newTaskForm = document.getElementById('new-task-form');

    let newTaskLists = document.getElementById('ntm-list-select');

    let newListForm = document.getElementById('new-list-form');

    let taskModal = document.getElementById('ntm');

    let listModal = document.getElementById('nlm');

    let newTaskFloatingButton = document.getElementById('new-task-floating-button');

    const createElement = (tag,classes,textContent,id) => {
        let element = document.createElement(tag);
        classes.forEach( value => {
            element.classList.add(value);
        })
        element.textContent = textContent;
        if(id!='' && id!=undefined && id!=null) element.id = id;
        return element;
    }

    const status2badge = (status) => {
        let badge = document.createElement('span');
        let statusClass = '';
        let statusText = '';
        switch(status){
            case 'due':
                statusClass = 'bg-warning';
                statusText = 'Due';
                break;
            case 'progress':
                statusClass = 'bg-primary';
                statusText = 'In progress';
                break;
            case 'completed':
                statusClass = 'bg-success';
                statusText = 'Completed';
                break;
            case '':
                statusClass = 'bg-info';
                statusText = '';
            default:
                statusClass = 'bg-secondary';
                statusText = '';
        }
        badge.classList.add('badge','rounded-pill','card-badge',statusClass);
        badge.textContent = statusText;
        return badge;
    }

    const priority2badge = (priority) => {
        let badge = document.createElement('span');
        let pClass = '';
        let pText = '';
        switch(priority){
            case 'low':
                pClass = 'bg-secondary';
                pText = 'Low';
                break;
            case 'medium':
                pClass = 'bg-info';
                pText = 'Medium';
                break;
            case 'high':
                pClass = 'bg-primary';
                pText = 'High';
                break;
            case '':
                pClass = 'bg-info';
                pText = '';
            default:
                pClass = 'bg-secondary';
                pText = '';
        }
        badge.classList.add('badge','rounded-pill','margin-r-2px','card-badge',pClass);
        badge.textContent = pText;
        return badge;
    }

    const formatDate = (date) => {
        if (date!=0) {
            return format(date,"MMM dd, yyyy, hh:mm a")+" ("+format(date,"eee")+", "+formatDistanceToNow(date,{addSuffix: true})+")";
        }
        else{
            return ''
        } 
    }

    const formatDateISO = (date) => {
        if(date!=0){
            return format(date,'yyyy-MM-dd')+"T"+format(date,'hh:mm');
        }
        else{
            return ''
        }
    }

    const createTask = (task) => {


        let card = createElement('div',['card','mb-1','box-shadow--2dp','card-hover'],'',`task-${task.id}`);
        card.setAttribute('data-task-id',task.id);
        let cardBody = createElement('div',['card-body']);
        let cardRmvConfirm = createElement('div',['d-flex','justify-content-between','align-items-center','card-remove-confirm','rounded-3','p-1','mb-1','d-none'],'Remove Task? ')//d-none
        let rmvBtn = createElement('span',['btn','btn-sm','btn-light'],'Yes');
        let rmvCancelBtn = createElement('span',['btn','btn-sm','btn-primary'],'No');
        cardRmvConfirm.append(rmvCancelBtn,rmvBtn);
        let cardHeader = createElement('div',['d-flex','align-self-center','w-100','justify-content-between','card-hdr']);
        let cardButtons = createElement('div',['d-flex','justify-content-end','align-self-center']);
        let cardEdit = createElement('button',['bg-transparent','border-0','btn-interact','card-hdr-btn'],'✐');
        cardEdit.setAttribute('data-bs-toggle','modal');
        cardEdit.setAttribute('data-bs-target','#ntm');
        cardEdit.setAttribute('data-mode','edit');
        cardEdit.setAttribute('data-task-id',task.id);
        let cardRemove = createElement('button',['bg-transparent','border-0','btn-interact','card-hdr-btn'],'✕');
        cardRemove.addEventListener('click', e => {
            cardRmvConfirm.classList.remove('d-none');
        })
        rmvBtn.addEventListener('click', e => {
            cardRmvConfirm.classList.add('d-none');
            removeTask(task);
            app.utils.removeTask(task);
        })
        rmvCancelBtn.addEventListener('click', e => {
            cardRmvConfirm.classList.add('d-none');
        })
        cardButtons.append(cardEdit,cardRemove);
        let cardTitle = createElement('h6',['card-title'],task.name);
        let cardDesc = createElement('div',['card-description','mb-2'],task.description);
        let cardFooter = createElement('div',['d-flex','d-flex-row','mb-0']);
        let cardDate = createElement('div',['card-text','card-date']);
        let cardDateSm = createElement('small',['text-muted'],formatDate(task.date));
        let cardBadges = createElement('div',['card-badges','d-flex','justify-content-end','align-self-start','w-100']);
        cardDate.append(cardDateSm);
        let cardStatus = status2badge(task.status);
        let cardPriority = priority2badge(task.priority);
        cardHeader.append(cardTitle,cardButtons);
        cardBadges.append(cardPriority,cardStatus);
        cardFooter.append(cardDate,cardBadges);
        cardBody.append(cardRmvConfirm,cardHeader,cardDesc,cardFooter);
        card.append(cardBody);
        showTask(card,task.list);


        return card;
    }

    const editTask = (task) => {

        let taskCard = document.getElementById(`task-${task.id}`);

        taskCard.querySelector('.card-title')
            .textContent = task.name;
        taskCard. querySelector('.card-description')
            .textContent = task.description;
        taskCard.querySelector('.card-date')
            .firstChild
            .textContent = formatDate(task.date);
        
        let badges = taskCard.querySelector('.card-badges')
        badges.firstChild.remove()
        badges.lastChild.remove()
        badges.append(priority2badge(task.priority));
        badges.append(status2badge(task.status));
        
        if (taskCard.parentElement.dataset.listId != task.list){
            moveTask(task);
        }        
    }

    const removeTask = (task) => {

        let listContainer = document.getElementById(`list-${task.list}`);
        let taskContainer = document.getElementById(`task-${task.id}`);

        listContainer.removeChild(taskContainer);

        if(app.tasks[app.utils.getListIndex(task.list)].tasks.length == 1){
             listContainer.append(emptyMsg());
        }

    }

    const showTask = (card,list) =>{

        let taskContainer = document.getElementById(`list-${list}`);
        
        if(taskContainer.querySelector('p')){
            taskContainer.removeChild(taskContainer.querySelector('p'));
        }
        taskContainer.append(card);

    }

    const moveTask = (task) => {

        let card = document.getElementById(`task-${task.id}`);
        if(card.parentElement.childElementCount == 2){
            card.parentElement.append(emptyMsg());
        };
        showTask(card,task.list);
    }

    const emptyMsg = () => {
        return createElement('p',['text-center','text-muted','fw-light','mb-0'],'You are up to date!')
    }

    const createList = (list) => {

        let listContainer = document.getElementById('lists-container');

        let listCard = createElement('div',['card-list','m-1','d-flex','flex-column','align-self-start','p-2','bg-lightgray','rounded-2','border','border-1','flex-shrink-0','overflow-auto','box-shadow--2dp'],'',`list-${list.id}`);
        listCard.setAttribute('data-list-id',list.id);

        let cardRmvConfirm = createElement('div',['d-flex','align-items-center','card-remove-confirm','rounded-3','p-1','mb-1','d-none'],'Remove List? ')//d-none
        let rmvBtn = createElement('span',['btn','btn-sm','btn-light','ms-1'],'Yes');
        let rmvCancelBtn = createElement('span',['btn','btn-sm','btn-primary','ms-1'],'No');
        cardRmvConfirm.append(rmvCancelBtn,rmvBtn);
        let cardHeader = createElement('div',['d-flex','align-self-center','w-100','justify-content-between','card-hdr']);
        let cardButtons = createElement('div',['d-flex','justify-content-end','align-self-center']);

        let cardEdit = createElement('button',['bg-transparent','border-0','btn-interact','card-hdr-btn'],'✐');
        cardEdit.setAttribute('data-bs-toggle','modal');
        cardEdit.setAttribute('data-bs-target','#nlm');
        cardEdit.setAttribute('data-mode','edit');
        cardEdit.setAttribute('data-list-id',list.id);

        let cardRemove = createElement('button',['bg-transparent','border-0','btn-interact','card-hdr-btn'],'✕');

        cardRemove.addEventListener('click', e => {
            cardRmvConfirm.classList.remove('d-none');
        })
        rmvBtn.addEventListener('click', e => {
            cardRmvConfirm.classList.add('d-none');
            removeList(list);
            app.utils.removeList(list);
        })
        rmvCancelBtn.addEventListener('click', e => {
            cardRmvConfirm.classList.add('d-none');
        })

        let cardTitle = createElement('h5',[],list.name);
        cardButtons.append(cardEdit,cardRemove);
        cardHeader.append(cardTitle,cardButtons);

        let emptyText = emptyMsg();

        listCard.append(cardRmvConfirm,cardHeader, emptyText);
        listContainer.insertBefore(listCard,document.getElementById('new-list-button-cont'));

        return listCard
    }

    const editList = (list) => {
        let listContainer = document.getElementById(`list-${list.id}`);
        let listName =listContainer.querySelector('h5');
        listName.textContent = list.name;
    }

    const removeList = (list) => {
        let listContainer = document.getElementById(`list-${list.id}`);
        listContainer.remove();
    }

    const updatelistSelect = () => {
        while (newTaskLists.firstChild) {
            newTaskLists.removeChild(newTaskLists.lastChild);
        }
        app.tasks.forEach( (list) => {
            let option = document.createElement('option');
            option.textContent = list.name
            option.value = list.id;
            newTaskLists.append(option);
        });
    }

    newTaskForm.addEventListener('submit', e => {
        e.preventDefault();

        let modalEl = document.getElementById('ntm');
        let modal = bootstrap.Modal.getInstance(modalEl);

        let mode = modalEl.dataset.mode;

        const prePayload = new FormData(e.target);
        let payload = {};
        prePayload.forEach((value, key) => (payload[key] = value));
        payload = app.Task(
            payload['ntm-list-select'],
            payload['ntm-task-name'],
            payload['ntm-description-text'],
            payload['task-due-date'],
            payload['priority'],
            payload['status'],
        );

        switch(mode){
            case 'create':
                app.utils.createTask(payload);
                createTask(payload);
                break;
            case 'edit':
                payload.id = taskModal.dataset.taskId;
                app.utils.editTask(payload);
                editTask(payload);
                break;
        }
        modal.hide();
    })

    newListForm.addEventListener('submit', e=> {
        
        e.preventDefault();

        let modalEl = document.getElementById('nlm');
        let modal = bootstrap.Modal.getInstance(modalEl);

        let mode = modalEl.dataset.mode;

        const prePayload = new FormData(e.target);
        let payload = {};
        prePayload.forEach((value, key) => (payload[key] = value));
        payload = app.List(
            payload['nlm-list-name']
        );

        switch(mode){
            case 'create':
                app.utils.createList(payload);
                createList(payload);
                break;
            case 'edit':
                payload.id = listModal.dataset.listId;
                app.utils.editList(payload);
                editList(payload);
                break;
        }

        modal.hide();
    })

    taskModal.addEventListener('show.bs.modal', e => {

        let trigger = e.relatedTarget;
        let mode = trigger.dataset.mode;
        taskModal.setAttribute('data-mode',mode);
        updatelistSelect();

        let modalTitle = document.getElementById('newTaskModalLabel');
        let taskName = document.getElementById('ntm-task-name');
        let taskDesc = document.getElementById('ntm-description-text');
        let taskList = document.getElementById('ntm-list-select');
        let taskDate = document.getElementById('ntm-task-due-date');
        let taskPriority = document.getElementById('priority-form');
        let taskStatus = document.getElementById('status-form');
        let modalSubmitBtn = document.getElementById('ntm-submit-btn');

        if(mode == 'create'){
            modalTitle.textContent = "Create new Task";
            modalSubmitBtn.textContent = "Create task";
        }
        else if(mode == 'edit'){

            let taskId = trigger.dataset.taskId;

            let task = app.utils.getTask(taskId);

            taskModal.setAttribute('data-task-id',task.id);

            modalTitle.textContent = "Edit Task";
            modalSubmitBtn.textContent = "Done";

            taskList.value = task.list;

            taskName.value = task.name;
            taskDesc.value = task.description;
            taskDate.value = formatDateISO(task.date);

            if(task.priority!=undefined){
                let priority = task.priority == '' ? 'none' : task.priority;
                taskPriority.querySelector(`#ntm-priority-${priority}`)
                    .setAttribute('checked',true);
            }

            if(task.status!=undefined){
                let status = task.status == '' ? 'none' : task.status;
                taskStatus.querySelector(`#ntm-status-btn-${status}`)
                    .setAttribute('checked',true);
            }

        }
    });

    taskModal.addEventListener('hide.bs.modal', e => {
        newTaskForm.reset();
    });

    listModal.addEventListener('show.bs.modal', e=> {

        let trigger = e.relatedTarget;
        let mode = trigger.dataset.mode;
        listModal.setAttribute('data-mode',mode);

        let modalTitle = document.getElementById('newListModalLabel');
        let listName = document.getElementById('nlm-list-name');
        let modalSubmitBtn = document.getElementById('nlm-submit-btn');


        if(mode=='edit'){

            let listId = trigger.dataset.listId;

            let list = app.tasks[listId];

            listModal.setAttribute('data-list-id',list.id);

            modalTitle.textContent = 'Edit List';
            listName.value = list.name;
            modalSubmitBtn.textContent = 'Done';

        }
        else if(mode=='create'){

            modalTitle.textContent = "Create new list";
            modalSubmitBtn.textContent = "Create";

        }
    })

    listModal.addEventListener('hide.bs.modal', e => {
        newListForm.reset();
    })

    return {
        createList,
        createTask,
        removeTask,
        
    };
})();