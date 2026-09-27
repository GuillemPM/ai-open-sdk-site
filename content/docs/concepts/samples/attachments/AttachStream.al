Request: Record "AIOS Chat Request";
TempBlob: Codeunit "Temp Blob";
begin
    // TempBlob holds a PDF, for example an exported sales invoice
    Request.SetPrompt('List the invoice lines and the total amount.');
    Request.Attach(TempBlob, 'application/pdf', 'invoice-103001.pdf');

    Result := Client.GenerateText(Model, Request);
end;
