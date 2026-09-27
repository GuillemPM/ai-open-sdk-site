Messages: JsonArray;
HistoryText: Text;
begin
    Messages := Request.GetMessages();
    Messages.WriteTo(HistoryText);
    // Store HistoryText in your own table (Blob field), then later:

    Messages.ReadFrom(HistoryText);
    Request.SetMessages(Messages);
end;
