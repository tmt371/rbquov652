// File: 04-core-code/app-controller.js

import { EVENTS } from './config/constants.js';

/**
 * @fileoverview The main controller of the application.
 * It listens to domain events and delegates tasks to appropriate services or views.
 * Refactored to be a pure event router.
 */
export class AppController {
    constructor({ eventAggregator, uiManager, workflowService, quickQuoteView, detailConfigView, rightPanelComponent }) {
        this.eventAggregator = eventAggregator;
        this.uiManager = uiManager;
        this.workflowService = workflowService;
        this.quickQuoteView = quickQuoteView;
        this.detailConfigView = detailConfigView;
        this.rightPanelComponent = rightPanelComponent;
        console.log("AppController (Refactored with grouped subscriptions) Initialized.");
    }

    initialize() {
        this._subscribeToCoreEvents();
        this._subscribeToStateChanges();
        this._subscribeToViewChanges();
        this._subscribeToQuickQuoteViewEvents();
        this._subscribeToDetailConfigViewEvents();
        this._subscribeToRightPanelEvents();
        this._subscribeToWorkflowEvents();
    }

    _subscribeToCoreEvents() {
        this.eventAggregator.subscribe(EVENTS.APP_READY, () => this.uiManager.renderInitialState());
        this.eventAggregator.subscribe(EVENTS.SHOW_NOTIFICATION, (payload) => this.uiManager.showNotification(payload.message, payload.type));
        this.eventAggregator.subscribe(EVENTS.SHOW_CONFIRMATION_DIALOG, (payload) => this.uiManager.showDialog(payload));
        this.eventAggregator.subscribe(EVENTS.FILE_LOADED, (payload) => this.workflowService.handleFileLoad(payload));
        this.eventAggregator.subscribe(EVENTS.TRIGGER_FILE_LOAD, () => this.workflowService.triggerFileLoad());
    }

    _subscribeToStateChanges() {
        this.eventAggregator.subscribe(EVENTS.INTERNAL_STATE_UPDATED, (state) => {
            this.eventAggregator.publish(EVENTS.STATE_CHANGED, state);
        });
        this.eventAggregator.subscribe(EVENTS.STATE_CHANGED, (state) => this.uiManager.render(state));
    }
    
    _subscribeToViewChanges() {
        // This is a placeholder for future logic if needed.
        // The original logic was based on the now-removed VIEWS constant.
    }

    _subscribeToWorkflowEvents() {
        this.eventAggregator.subscribe(EVENTS.PRINTABLE_QUOTE_REQUESTED, () => this.workflowService.handlePrintableQuoteRequest());
    }

    _subscribeToQuickQuoteViewEvents() {
        // This section contains the correct, separated event subscriptions
        // from the voided 4th revision.
        this.eventAggregator.subscribe(EVENTS.TABLE_CELL_CLICKED, (payload) => {
            if (this.uiManager.getCurrentViewName() === 'QUICK_QUOTE') {
                this.quickQuoteView.handleTableCellClick(payload);
            } else {
                this.detailConfigView.handleTableCellClick(payload);
            }
        });
        this.eventAggregator.subscribe(EVENTS.SEQUENCE_CELL_CLICKED, (payload) => {
            if (this.uiManager.getCurrentViewName() === 'QUICK_QUOTE') {
                this.quickQuoteView.handleSequenceCellClick(payload);
            } else {
                this.detailConfigView.handleSequenceCellClick(payload);
            }
        });
        
        this.eventAggregator.subscribe(EVENTS.NUMERIC_KEY_PRESSED, (payload) => this.quickQuoteView.handleNumericKeyPress(payload));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_INSERT_ROW, () => this.quickQuoteView.handleInsertRow());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_DELETE_ROW, () => this.quickQuoteView.handleDeleteRow());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CLEAR_ROW, () => this.quickQuoteView.handleClearRow());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_SAVE_TO_FILE, () => this.quickQuoteView.handleSaveToFile());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_EXPORT_CSV, () => this.quickQuoteView.handleExportCSV());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_RESET, () => this.quickQuoteView.handleReset());
        this.eventAggregator.subscribe(EVENTS.USER_MOVED_ACTIVE_CELL, (payload) => this.quickQuoteView.handleMoveActiveCell(payload));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CALCULATE_AND_SUM, () => this.quickQuoteView.handleCalculateAndSum());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CYCLE_TYPE, () => this.quickQuoteView.handleCycleType());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_MULTI_SELECT_MODE, () => this.quickQuoteView.handleToggleMultiSelectMode());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_SAVE_THEN_LOAD, () => this.quickQuoteView.handleSaveThenLoad());
        this.eventAggregator.subscribe(EVENTS.TYPE_CELL_LONG_PRESSED, (payload) => this.quickQuoteView.handleTypeCellLongPress(payload));
        this.eventAggregator.subscribe(EVENTS.TYPE_BUTTON_LONG_PRESSED, () => this.quickQuoteView.handleTypeButtonLongPress());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_MULTI_TYPE_SET, () => this.quickQuoteView.handleMultiTypeSet());
    }

    _subscribeToDetailConfigViewEvents() {
        this.eventAggregator.subscribe(EVENTS.DETAIL_VIEW_SAVE_AND_EXIT, () => this.detailConfigView.handleSaveAndExit());
        this.eventAggregator.subscribe(EVENTS.DETAIL_VIEW_ABORT, () => this.detailConfigView.handleAbort());
        this.eventAggregator.subscribe(EVENTS.LF_DETAILS_UPDATED, (payload) => this.detailConfigView.handleLfDetailsUpdate(payload));
        this.eventAggregator.subscribe(EVENTS.LF_FABRIC_RESET, () => this.detailConfigView.handleFabricReset());
        this.eventAggregator.subscribe(EVENTS.DETAIL_KEY_PRESSED, (payload) => this.detailConfigView.handleDetailKeyPress(payload));
        this.eventAggregator.subscribe(EVENTS.K3_TABLE_CELL_CLICKED, (payload) => this.detailConfigView.handleK3TableCellClick(payload));
        this.eventAggregator.subscribe(EVENTS.DRIVE_CHAIN_SUBMIT, (payload) => this.detailConfigView.handleDriveChainSubmit(payload));
        this.eventAggregator.subscribe(EVENTS.DUAL_CHAIN_INPUT_SUBMIT, (payload) => this.detailConfigView.handleDualChainInputSubmit(payload));
        this.eventAggregator.subscribe(EVENTS.DRIVE_ACCESSORIES_SUBMIT, (payload) => this.detailConfigView.handleDriveAccessoriesSubmit(payload));
    }

    _subscribeToRightPanelEvents() {
        this.eventAggregator.subscribe(EVENTS.F1_DISCOUNT_CHANGED, (payload) => this.rightPanelComponent.handleDiscountChange(payload));
        this.eventAggregator.subscribe(EVENTS.F2_INPUT_CHANGED, (payload) => this.rightPanelComponent.handleF2InputChange(payload));
        this.eventAggregator.subscribe(EVENTS.F2_FEE_EXCLUSION_TOGGLED, (payload) => this.rightPanelComponent.handleF2FeeExclusionToggle(payload));
    }
}