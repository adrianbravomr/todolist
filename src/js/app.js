import { parseISO } from "date-fns";
import {dom} from "./domhandler";

export const app = (() => {
    let tasks = [];

    const List = (name,taskList=[]) => {
        let id = utils.calcListId(); 
        return {
            'name':name,
            'id':id,
            'tasks':taskList,
        }
    }

    const Task = (list,name,description,date,priority,status) => {
        let id = utils.calcTaskId();
        date = date == '' ? '' : parseISO(date);
        return {
            id,
            list,
            name,
            description,
            date,
            priority,
            status,
        }
    }

    const init = () => {
        if(!localStorage.data){
            let defaultList = List('My Tasks');
            utils.createList(defaultList);
            dom.createList(defaultList);
            localStorage.data = JSON.stringify(tasks);
        }


        else{
            let storageData = JSON.parse(localStorage.data);

            storageData.forEach(list => {
                utils.createList(list);
                dom.createList(list);
                if(list.tasks.length>0){
                    list.tasks.forEach(task => {
                        task.date = task.date == '' ? '' : parseISO(task.date);;
                        dom.createTask(task);
                    })
                }
            });
        }
    }

    const utils = (() => {

        const getTask = (id) => {
            id = Number(id);
            for(const list of tasks){
                let returnedTask = list.tasks.find(task => task.id === id);
                if(returnedTask) return returnedTask;
            }
        }

        const createTask = (task) => {
            let index = getListIndex(task.list);
            tasks[index].tasks.push(task);
            localStorage.data = JSON.stringify(tasks);
        }

        const editTask = (task) => {
            let newTask = getTask(task.id);

            if(newTask.list != task.list){
                tasks[task.list].tasks.push(
                    tasks[newTask.list].tasks
                        .splice(getTaskIndex(task),1)[0]
                )
            }

            newTask.list = task.list;
            newTask.name = task.name;
            newTask.description = task.description;
            newTask.date = task.date;
            newTask.priority = task.priority;
            newTask.status = task.status;

            localStorage.data = JSON.stringify(tasks);

        }

        const removeTask = (task) => {
            let index = getTaskIndex(task);
            tasks[getListIndex(task.list)].tasks.splice(index,1);

            localStorage.data = JSON.stringify(tasks);
        } 

        const calcTaskId = () => {
            if(tasks[0]!=undefined){
                let higher = tasks.reduce( (higherList,CurrList,listIndex) => {
                    return  higherList > _getListHigherTaskId(listIndex) ? higherList: _getListHigherTaskId(listIndex);
                }, 0)
                return higher+1;
            }
            else return 0;          
        }

        const _getListHigherTaskId = (listIndex) => {
            return tasks[listIndex].tasks.reduce( (higherTask,currTask,taskIndex) => {
                return higherTask > currTask.id ? higherTask:currTask.id
             }, -Infinity)
        }

        const taskCount = () => {
            let sum = 0;
            tasks.forEach((list) => {
                sum+=list.tasks.length;
            })
            return sum;
        }

        const createList = (list) => {
            tasks.push(list);
            localStorage.data = JSON.stringify(tasks);
        }

        const editList = (list) => {
            tasks[getListIndex(list.id)].name = list.name;
            localStorage.data = JSON.stringify(tasks);
        }

        const removeList = (list) => {
            tasks.splice(getListIndex(list.id),1);
            localStorage.data = JSON.stringify(tasks);
        }

        const calcListId = () => {
            if(tasks[0]!=undefined) return tasks[tasks.length-1].id + 1;
            else return 0;
        }

        const getListIndex = (id) => {
            return tasks.findIndex( list => list.id == id);
        }

        const getTaskIndex = (task) => {
            return tasks[getListIndex(task.list)].tasks.findIndex( t => t.id === task.id);
        }



    
        return {
            createTask,
            editTask,
            removeTask,
            taskCount,
            calcTaskId,
            getTask,
            createList,
            editList,
            removeList,
            calcListId,
            getListIndex,
            getTaskIndex,
        }
    
    })();

    return {
        init,
        tasks,
        Task,
        List,
        utils,
    }
})();