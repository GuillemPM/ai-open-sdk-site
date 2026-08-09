[EventSubscriber(ObjectType::Codeunit, Codeunit::"AIOS Tool Set", 'OnExecuteTool', '', false, false)]
local procedure OnExecuteTool(
    Name: Text;
    Arguments: JsonObject;
    var ResultText: Text;
    var Succeeded: Boolean;
    var Handled: Boolean)
begin
    if Name <> 'echo' then
        exit;
    Succeeded := Echo(Arguments, ResultText);
    Handled := true;
end;
