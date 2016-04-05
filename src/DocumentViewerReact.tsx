import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { DocumentViewer as DocumentViewerImpl, IDocumentViewerDocument } from "./DocumentViewer";

export interface IDocumentViewerProps {
    data: IDocumentViewerDocument[];
};

export interface IDocumentViewerState { }

/**
 * Thin wrapper around LineUp
 */
export class DocumentViewer extends React.Component<IDocumentViewerProps, IDocumentViewerState> {
    public props: IDocumentViewerProps;
    private documentViewer: DocumentViewerImpl;
    private node: any;

    public componentDidMount(): void {
        this.node = ReactDOM.findDOMNode(this);
        this.documentViewer = new DocumentViewerImpl($(this.node));
        this.renderContent();
    }

    public componentWillReceiveProps(newProps: IDocumentViewerProps): void {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    public render(): JSX.Element {
        return (<div style={{ height: "100%", width: "100%" }}></div>);
    }

    private renderContent(props?: IDocumentViewerProps): void {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.documentViewer.data = props.data;
    }
}
