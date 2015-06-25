var utils = require('../utils');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe.only('backlog', function() {
    before(async function() {
        browser.get('http://localhost:9001/project/user7-project-example-0/backlog');

        await utils.common.waitLoader();

        utils.common.takeScreenshot('backlog', 'backlog');
    });

    describe('create US', function() {
        let createUSLightbox = null;

        before(async function() {
            $$('.new-us a').get(0).click();

            await utils.lightbox.open('div[tg-lb-create-edit-userstory]');

            createUSLightbox = $('div[tg-lb-create-edit-userstory]');
        });

        it('capture screen', function() {
            utils.common.takeScreenshot('backlog', 'create-us');
        });

        it('fill form', async function() {
            // subject
            createUSLightbox.$('input[name="subject"]').sendKeys('subject');

            // roles
            let roles = createUSLightbox.$$('.points-per-role li');

            let role1 = roles.get(1);
            await utils.popover.open(role1, 3);

            let role2 = roles.get(3);
            await utils.popover.open(role2, 4);

            let totalPoints = await roles.get(0).$('.points').getText();

            expect(totalPoints).to.be.equal('3');

            // status
            createUSLightbox.$('select option:nth-child(2)').click();

            // tags
            $('.tag-input').sendKeys('aaa');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            $('.tag-input').sendKeys('bbb');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            // description
            createUSLightbox.$('textarea[name="description"]').sendKeys('test test');

            //settings
            createUSLightbox.$$('.settings label').get(0).click();

            await browser.sleep(200);

            utils.common.takeScreenshot('backlog', 'create-us-filled');
        });

        it('send form', async function() {
            let usCount = await $$('.backlog-table-body > div').count();

            createUSLightbox.$('button[type="submit"]').click();

            await utils.lightbox.close(createUSLightbox);

            let newUsCount = await $$('.backlog-table-body > div').count();

            expect(newUsCount).to.be.equal(usCount + 1);
        });
    });

    describe('bulk create US', function() {
        let createUSLightbox = null;

        before(async function() {
            $$('.new-us a').get(1).click();

            await utils.lightbox.open('div[tg-lb-create-bulk-userstories]');

            createUSLightbox = $('div[tg-lb-create-bulk-userstories]');
        });

        it('fill form', function() {
            createUSLightbox.$('textarea').sendKeys('aaa');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            createUSLightbox.$('textarea').sendKeys('bbb');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();
        });

        it('send form', async function() {
            let usCount = await $$('.backlog-table-body > div').count();

            createUSLightbox.$('button[type="submit"]').click();

            await utils.lightbox.close(createUSLightbox);

            let newUsCount = await $$('.backlog-table-body > div').count();

            expect(newUsCount).to.be.equal(usCount + 2);
        });
    });

    describe('edit US', function() {
        let editUSLightbox = null;

        before(async function() {
            $$('.backlog-table-body .icon-edit').first().click();

            await utils.lightbox.open('div[tg-lb-create-edit-userstory]');

            editUSLightbox = $('div[tg-lb-create-edit-userstory]');
        });

        it('fill form', async function() {
            // subject
            editUSLightbox.$('input[name="subject"]').sendKeys('subjectedit');

            // roles
            let roles = editUSLightbox.$$('.points-per-role li');

            let role1 = roles.get(1);
            await utils.popover.open(role1, 3);

            let role2 = roles.get(2);
            await utils.popover.open(role2, 3);

            let role3 = roles.get(3);
            await utils.popover.open(role3, 3);

            let role4 = roles.get(4);
            await utils.popover.open(role4, 3);

            let totalPoints = await roles.get(0).$('.points').getText();

            expect(totalPoints).to.be.equal('4');

            // status
            editUSLightbox.$('select option:nth-child(3)').click();

            // tags
            $('.tag-input').sendKeys('www');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            $('.tag-input').sendKeys('xxx');
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            // description
            editUSLightbox.$('textarea[name="description"]').sendKeys('test test test test');

            //settings
            editUSLightbox.$$('.settings label').get(1).click();

            await browser.sleep(200);
        });

        it('send form', async function() {
            editUSLightbox.$('button[type="submit"]').click();

            await utils.lightbox.close(editUSLightbox);
        });
    });

    it('edit status inline', async function() {
        let status = $$('.backlog-table-body > div .us-status').first();

        await utils.popover.open(status, 1);

        //debounce
        await browser.sleep(2000);

        await utils.popover.open(status, 2);

        let statusText = await status.$$('span').first().getText();

        expect(statusText).to.be.equal('In progress');
    });

    it('edit points inline', async function() {
        let points = $$('.backlog-table-body > div .us-points').first();

        await utils.popover.open(points, 1, 1);

        //debounce
        await browser.sleep(2000);

        await utils.popover.open(points, 2, 6);

        expect(utils.notifications.success.open()).to.be.eventually.true;
    });

    it('delete US', async function() {
        let usCount = await $$('.backlog-table-body > div').count();

        $$('.backlog-table-body > div .icon-delete').first().click();

        await utils.lightbox.confirm.ok();

        let newUsCount = await $$('.backlog-table-body > div').count();

        expect(newUsCount).to.be.equal(usCount - 1);
    });

    it('drag backlog us', async function() {
        let dragableElements = $$('.backlog-table-body > div');
        let dragElement = dragableElements.get(5);
        let dragElementHandler = dragElement.$('.icon-drag-v');


        let draggedElementText = await dragElement.element(by.binding('us.subject')).getText();

        await utils.common.drag(dragElement, dragableElements.get(0));
        await browser.waitForAngular();

        let firstElementText = await dragableElements.get(0).element(by.binding('us.subject')).getText();

        expect(draggedElementText).to.be.equal(firstElementText);
    });

    it('reorder multiple us', async function() {
        let dragableElements = $$('.backlog-table-body > div');

        let count = await dragableElements.count();

        let draggedTexts = [];

        //element 1
        let dragElement = dragableElements.get(count - 1);
        let dragElementHandler = dragElement.$('.icon-drag-v');
        dragElement.$('input[type="checkbox"]').click();
        draggedTexts.push(await dragElement.element(by.binding('us.subject')).getText());

        //element 2
        dragElement = dragableElements.get(count - 2);
        dragElement.$('input[type="checkbox"]').click();
        draggedTexts.push(await dragElement.element(by.binding('us.subject')).getText());

        await utils.common.drag(dragElementHandler, dragableElements.get(0));
        await browser.waitForAngular();

        let elementText1 = await dragableElements.get(0).element(by.binding('us.subject')).getText();
        let elementText2 = await dragableElements.get(1).element(by.binding('us.subject')).getText();

        expect(elementText2).to.be.equal(draggedTexts[0]);
        expect(elementText1).to.be.equal(draggedTexts[1]);
    });

    it('drag us to milestone', async function() {
        let sprint = $$('div[tg-backlog-sprint="sprint"]').get(1);

        let dragableElements = $$('.backlog-table-body > div');
        let dragElement = dragableElements.get(0);
        let dragElementHandler = dragElement.$('.icon-drag-v');

        let draggedElementText = await dragElement.element(by.binding('us.subject')).getText();

        await utils.common.drag(dragElement, sprint);
        await browser.waitForAngular();

        let firstElementText = await sprint.$$('.milestone-us-item-row').first().$$('span').get(1).getText();

        expect(draggedElementText).to.be.equal(firstElementText);
    });

    it('drag multiple us to milestone', async function() {
        let sprint = $$('div[tg-backlog-sprint="sprint"]').get(1);

        let dragableElements = $$('.backlog-table-body > div');

        let draggedTexts = [];

        //element 1
        let dragElement = dragableElements.get(0);
        let dragElementHandler = dragElement.$('.icon-drag-v');
        dragElement.$('input[type="checkbox"]').click();
        draggedTexts.push(await dragElement.element(by.binding('us.subject')).getText());

        //element 2
        dragElement = dragableElements.get(1);
        dragElement.$('input[type="checkbox"]').click();
        draggedTexts.push(await dragElement.element(by.binding('us.subject')).getText());

        await utils.common.drag(dragElementHandler, sprint);

        await browser.waitForAngular();

        let elementText1 = await sprint.$$('.milestone-us-item-row').get(0).$$('span').get(1).getText();
        let elementText2 = await sprint.$$('.milestone-us-item-row').get(1).$$('span').get(1).getText();

        expect(elementText1).to.be.equal(draggedTexts[0]);
        expect(elementText2).to.be.equal(draggedTexts[1]);
    });

    it('reorder milestone', async function() {
        let sprint = $$('div[tg-backlog-sprint="sprint"]').get(0);
        let dragableElements = sprint.$$('.milestone-us-item-row');

        let dragElement = await dragableElements.get(3);
        let draggedElementText = await dragElement.$$('span').get(1).getText();

        await utils.common.drag(dragElement, dragableElements.get(0));
        await browser.waitForAngular();

        dragableElements = sprint.$$('.milestone-us-item-row');

        let firstElementText = await dragableElements.get(0).$$('span').get(1).getText();

        expect(draggedElementText).to.be.equal(firstElementText);
    });

    it('drag us from milestone to milestone', async function() {
        let sprint1 = $$('div[tg-backlog-sprint="sprint"]').get(0);
        let sprint2 = $$('div[tg-backlog-sprint="sprint"]').get(1);

        let dragElement = sprint1.$$('.milestone-us-item-row').get(0);
        let dragElementText = await sprint1.$$('.milestone-us-item-row').$$('span').get(1).getText();

        await utils.common.drag(dragElement, sprint2);
        await browser.waitForAngular();

        let firstElementText = await sprint2.$$('.milestone-us-item-row').$$('span').get(1).getText();

        expect(dragElementText).to.be.equal(firstElementText);
    });

    describe('milestones', function() {
        it('create', async function() {
            $('.add-sprint').click();

            let createMilestoneLightbox = $('div[tg-lb-create-edit-sprint]');

            await utils.lightbox.open(createMilestoneLightbox);

            utils.common.takeScreenshot('backlog', 'create-milestone');

            let sprintName = 'sprintName' + new Date().getTime();

            createMilestoneLightbox.element(by.model('sprint.name')).sendKeys(sprintName);

            createMilestoneLightbox.$('button[type="submit"]').click();
            await browser.waitForAngular();

            let sprintTexts = await $$('div[tg-backlog-sprint="sprint"] .sprint-name span').getText();

            expect(sprintTexts.indexOf(sprintName)).to.be.not.equal(-1);
        });

        it('edit', async function() {
            $$('div[tg-backlog-sprint="sprint"] .icon-edit').get(0).click();

            let createMilestoneLightbox = $('div[tg-lb-create-edit-sprint]');

            await utils.lightbox.open(createMilestoneLightbox);

            let sprintName = 'sprintName' + new Date().getTime();

            createMilestoneLightbox.element(by.model('sprint.name')).sendKeys(sprintName);

            createMilestoneLightbox.$('button[type="submit"]').click();
            await browser.waitForAngular();

            let sprintTexts = await $$('div[tg-backlog-sprint="sprint"] .sprint-name span').getText();

            expect(sprintTexts.indexOf(sprintName)).to.be.not.equal(-1);
        });

        it('delete', async function() {
            $$('div[tg-backlog-sprint="sprint"] .icon-edit').get(0).click();

            let createMilestoneLightbox = $('div[tg-lb-create-edit-sprint]');

            await utils.lightbox.open(createMilestoneLightbox);

            createMilestoneLightbox.$('.delete-sprint .icon-delete').click();

            await utils.lightbox.confirm.ok();

            await browser.waitForAngular();

            let sprintName = createMilestoneLightbox.element(by.model('sprint.name')).getAttribute('value');

            let sprintTexts = await $$('div[tg-backlog-sprint="sprint"] .sprint-name span').getText();

            expect(sprintTexts.indexOf(sprintName)).to.be.equal(-1);
        });
    });

    describe('tags', function() {
        it('show', function() {
            $('#show-tags').click();

            let tag = $$('.backlog-table .tag').get(0);

            expect(tag.isDisplayed()).to.be.eventually.true;
        });

        it('hide', function() {
            $('#show-tags').click();

            let tag = $$('.backlog-table .tag').get(0);

            expect(tag.isDisplayed()).to.be.eventually.false;
        });
    });
});
