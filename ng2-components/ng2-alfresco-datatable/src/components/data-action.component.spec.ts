/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    it,
    describe,
    expect,
    beforeEach
} from 'angular2/testing';
import {EventEmitter} from 'angular2/core';

import { AlfrescoServiceMock } from '../assets/alfresco.service.mock';
import { DataTableComponent } from './datatable.component';
import { DataActionListComponent } from './data-action-list.component';
import { DataActionComponent } from './data-action.component';
import {DocumentActionsService} from '../services/document-actions.service';
import {FolderActionsService} from '../services/folder-actions.service';

describe('ContentAction', () => {

    let dataTable: DataTableComponent;
    let actionList: DataActionListComponent;

    beforeEach(() => {
        let alfrescoServiceMock = new AlfrescoServiceMock();
        dataTable = new DataTableComponent(alfrescoServiceMock);
        actionList = new DataActionListComponent(dataTable);
    });

    it('should register within parent actions list', () => {
        spyOn(actionList, 'registerAction').and.stub();

        let action = new DataActionComponent(actionList, null, null);
        action.ngOnInit();

        expect(actionList.registerAction).toHaveBeenCalled();
    });

    it('should setup and register model', () => {
        let action = new DataActionComponent(actionList, null, null);
        action.type = 'button';
        action.target = 'document';
        action.title = '<title>';
        action.icon = '<icon>';

        expect(dataTable.actions.length).toBe(0);
        action.ngOnInit();

        expect(dataTable.actions.length).toBe(1);

        let model = dataTable.actions[0];
        expect(model.type).toBe(action.type);
        expect(model.target).toBe(action.target);
        expect(model.title).toBe(action.title);
        expect(model.icon).toBe(action.icon);
    });

    it('should get action handler from document actions service', () => {

        let handler = function() {};
        let documentActions = new DocumentActionsService(null);
        spyOn(documentActions, 'getHandler').and.returnValue(handler);

        let action = new DataActionComponent(actionList, documentActions, null);
        action.type = 'button';
        action.target = 'document';
        action.handler = '<handler>';
        action.ngOnInit();

        expect(documentActions.getHandler).toHaveBeenCalledWith(action.handler);
        expect(dataTable.actions.length).toBe(1);

        let model = dataTable.actions[0];
        expect(model.handler).toBe(handler);
    });

    it('should get action handler from folder actions service', () => {
        let handler = function() {};
        let folderActions = new FolderActionsService();
        spyOn(folderActions, 'getHandler').and.returnValue(handler);

        let action = new DataActionComponent(actionList, null, folderActions);
        action.type = 'button';
        action.target = 'folder';
        action.handler = '<handler>';
        action.ngOnInit();

        expect(folderActions.getHandler).toHaveBeenCalledWith(action.handler);
        expect(dataTable.actions.length).toBe(1);

        let model = dataTable.actions[0];
        expect(model.handler).toBe(handler);
    });

    it('should require target to get system handler', () => {
        let folderActions = new FolderActionsService();
        spyOn(folderActions, 'getHandler').and.stub();

        let documentActions = new DocumentActionsService(null);
        spyOn(documentActions, 'getHandler').and.stub();

        let action = new DataActionComponent(actionList, documentActions, folderActions);
        action.type = 'button';
        action.handler = '<handler>';

        action.ngOnInit();
        expect(dataTable.actions.length).toBe(1);
        expect(folderActions.getHandler).not.toHaveBeenCalled();
        expect(documentActions.getHandler).not.toHaveBeenCalled();

        action.target = 'document';
        action.ngOnInit();
        expect(documentActions.getHandler).toHaveBeenCalled();

        action.target = 'folder';
        action.ngOnInit();
        expect(folderActions.getHandler).toHaveBeenCalled();
    });

    it('should be case insensitive for document target', () => {
        let documentActions = new DocumentActionsService(null);
        spyOn(documentActions, 'getHandler').and.stub();

        let action = new DataActionComponent(actionList, documentActions, null);
        action.target = 'DoCuMeNt';
        action.type = 'button';
        action.handler = '<handler>';

        action.ngOnInit();
        expect(documentActions.getHandler).toHaveBeenCalledWith(action.handler);
    });

    it('should be case insensitive for folder target', () => {
        let folderActions = new FolderActionsService();
        spyOn(folderActions, 'getHandler').and.stub();

        let action = new DataActionComponent(actionList, null, folderActions);
        action.target = 'FoLdEr';
        action.type = 'button';
        action.handler = '<handler>';

        action.ngOnInit();
        expect(folderActions.getHandler).toHaveBeenCalledWith(action.handler);
    });

    it('should use custom "execute" emitter', (done) => {
        let emitter = new EventEmitter();

        emitter.subscribe(e => {
            expect(e.value).toBe('<obj>');
            done();
        });

        let action = new DataActionComponent(actionList, null, null);
        action.target = 'document';
        action.type = 'button';
        action.execute = emitter;

        action.ngOnInit();
        expect(dataTable.actions.length).toBe(1);

        let model = dataTable.actions[0];
        model.handler('<obj>');
    });
});