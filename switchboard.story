# start
    text: "Hello there! Thanks so much for agreeing to fill in today, I know 
        it's short notice. Let's teach you how to connect calls and use this 
        switchboard before it starts getting busy."
    
    turnOnLight: Mabel
    
    text: "Mabel wants to make a call. First, you have to connect to her. Take 
        any cable in the back row of cables and plug it into the hole below her 
        light. It doesn't matter which cable you use, as long as it's in the 
        back row."

    <-> [connectWrongPerson exists]
        text: Whoops! You want to connect to Mabel instead of {connectWrongPerson}
    
    <-> [connectWrongCable]
        text: Whoops! You want to use one of the cables in the row farthest away from you.

    <-> [toggleWrongSwitch]
        text: Whoops! You don't want to touch the switches yet.

    -> first_switch: [Mabel.cable exists and Mable.isFront is false]

# first_switch
    turnOnLight: {Mabel.cableString}
    
    turnOffLight: Mabel

    text: "Great. Now Mabel needs to be able to tell you who she wants to talk 
        to. See those two switches in front of the cable you plugged in? Take 
        the one closest to the cable, and flip it away from you so you can hear 
        her."

    -> connect_to_dolores: [Mabel.cable exists and 
                            Mabel.isFront is false and 
                            Mabel.switch is -1]
                        
# connect_to_dolores
    sayToConnect: Mabel,Dolores
    pause: 800
    text: "Perfect. Put the switch back in its place, and connect the matching
        front cable to Dolores."

    -> ring_dolores: [Mabel.cable exists and
                    Mabel.isFront is false and 
                    Dolores.cable is Mabel.cable and 
                    Dolores.isFront is true]

# ring_dolores
    text: "Now, you need to ring Dolores so she knows someone's calling. 
        Take the front switch and pull it towards you."

    -> dolores_blinking: [
        Mabel.cable exists and
        Mabel.isFront is false and 
        Dolores.cable is Mabel.cable and 
        Dolores.isFront is true and
        Dolores.switch is 1
    ]

# dolores_blinking
    blinkLight: {Dolores.cableString},400
    text: "Great. The fact that it's blinking means the phone is ringing. 
        She'll pick up in a few seconds."
    pause: 1500
    turnOnLight: {Dolores.cableString}
    text: "Now that the light is solid, she's picked up the call and they're 
        talking. The lights will turn off when they're done."
    pause: 3000
    turnOffLight: {Dolores.cableString}
    turnOffLight: {Mabel.cableString}

# disconnect
    text: "They've finished their call, so you can disconnect their cables now"
    -> start_game: [Mabel.cable does_not_exist and Dolores.cable does_not_exist]

# start_game
    text: "It seems like you've've got it! 
        Things will pick up rather quickly, so do try to keep up"

## use_wrong_switch_row
    [graph.currentNodeId is first_switch and toggleWrongSwitchInPair is true]
    allows_repeats
    text: Flip the switch farther away from you.

## wrong_switch_col_talk
    [graph.currentNodeId is first_switch and toggleWrongSwitch is true]
    allows_repeats
    text: "Flip the switch that corresponds with the cable you're using, 
        not where Mabel is."

## wrong_switch_direction_talk
    [graph.currentNodeId is first_switch and toggleWrongSwitchDirection is true]
    allows_repeats
    text: Flip the switch the other way, so it's going away from you.

## shouldnt_need_switches
    -- We should be able to combine this with dont_use_switches?
    [graph.currentNodeId is connect_to_dolores and 
        toggleWrongSwitch is true]
    allows_repeats
    text: You shouldn't need to touch any switches!

## connect_wrong_person
    [graph.currentNodeId is connect_to_dolores and connectWrongPerson is true]
    allows_repeats
    text: You're supposed to connect to Dolores, not {connectWrongPerson}.

## use_wrong_second_cable
    [graph.currentNodeId is connect_to_dolores and connectWrongCable is true]
    allows_repeats
    text: "You want to use the cable that's directly in front of the one you 
        used with Mabel."
    
## wrong_switch_direction_ring
    [graph.currentNodeId is ring_dolores and toggleWrongSwitchDirection]
    allows_repeats
    text: Pull the switch towards you, not away from you

## wrong_switch_row_ring
    [graph.currentNodeId is ring_dolores and toggleWrongSwitchInPair]
    allows_repeats
    text: Use the switch that's closer to you.

## wrong_switch_col_wrong
    [graph.currentNodeId is ring_dolores and toggleWrongSwitch]
    allows_repeats
    text: "Use the switch that's in the same row as the cables you're using."

## disconnect_early
    [graph.currentNodeId is dolores_blinking and Mable.cable does_not_exist]
    allows_repeats
    text: "You shouldn't disconnect them until they're done talking. Their 
        lights will turn off when they're done."