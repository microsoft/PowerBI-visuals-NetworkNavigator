import * as React from "react";
import * as ReactDOM from "react-dom";
import { DocumentViewer as DocumentViewerImpl, IDocumentViewerDocument } from "./DocumentViewer";

export interface IDocumentViewerProps {
    data: IDocumentViewerDocument[]
};

export interface IDocumentViewerState { }

/**
 * Thin wrapper around LineUp
 */
export class DocumentViewer extends React.Component<IDocumentViewerProps, IDocumentViewerState> {
    private documentViewer: DocumentViewerImpl;
    private node: any;
    public props : IDocumentViewerProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.documentViewer = new DocumentViewerImpl($(this.node));
        this.renderContent();
    }

    componentWillReceiveProps(newProps : IDocumentViewerProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props? : IDocumentViewerProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.documentViewer.data = props.data;
    }
}